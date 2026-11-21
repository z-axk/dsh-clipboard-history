/**
 * Host half of the clipboard history plugin.
 *
 * The Web page can only observe copies made inside itself. This half watches the
 * operating-system clipboard and serves what it has seen over a same-origin route,
 * so text copied in other applications reaches the page's history as well.
 */
import { spawn } from 'node:child_process';

const ROUTE_PATH = '/dsh-clipboard-history/latest';
const BUFFER_LIMIT = 100;
const POLL_INTERVAL_MS = 700;

// ASCII only: the script is UTF-16LE encoded for -EncodedCommand before it is sent.
const WATCH_SCRIPT = [
  "$ErrorActionPreference = 'SilentlyContinue'",
  "$last = ''",
  'while ($true) {',
  '  $text = $null',
  '  try { $text = Get-Clipboard -Raw } catch { $text = $null }',
  '  if ($null -ne $text -and $text -ne $last) {',
  '    $last = $text',
  '    $bytes = [Text.Encoding]::UTF8.GetBytes($text)',
  '    $encoded = [Convert]::ToBase64String($bytes)',
  "    [Console]::Out.WriteLine('B64:' + $encoded)",
  '    [Console]::Out.Flush()',
  '  }',
  '  Start-Sleep -Milliseconds ' + POLL_INTERVAL_MS,
  '}',
].join('\n');

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function apply(ctx) {
  const webServer = ctx.get('webServer');
  if (!webServer) return;

  /** @type {{ id: number, ts: number, text: string }[]} */
  let entries = [];
  let paused = false;
  let sequence = 0;
  let lastText = '';
  let child;

  function record(text) {
    if (typeof text !== 'string') return;
    const value = text.trim();
    if (!value || value === lastText) {
      lastText = value;
      return;
    }
    lastText = value;
    sequence += 1;
    entries.push({ id: sequence, ts: Date.now(), text: value });
    if (entries.length > BUFFER_LIMIT) entries = entries.slice(entries.length - BUFFER_LIMIT);
  }

  function handleLine(line) {
    if (!line.startsWith('B64:')) return;
    let text = '';
    try {
      text = Buffer.from(line.slice(4), 'base64').toString('utf8');
    } catch (error) {
      return;
    }
    if (paused) {
      lastText = text.trim();
      return;
    }
    record(text);
  }

  function startWatcher() {
    try {
      const encoded = Buffer.from(WATCH_SCRIPT, 'utf16le').toString('base64');
      child = spawn(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded],
        { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }
      );
      child.stdout.setEncoding('utf8');
      let buffer = '';
      child.stdout.on('data', (chunk) => {
        buffer += chunk;
        let newline = buffer.indexOf('\n');
        while (newline >= 0) {
          const line = buffer.slice(0, newline).replace(/\r$/, '');
          buffer = buffer.slice(newline + 1);
          if (line) handleLine(line);
          newline = buffer.indexOf('\n');
        }
      });
      child.on('error', () => {
        child = undefined;
      });
      child.on('exit', () => {
        child = undefined;
      });
    } catch (error) {
      child = undefined;
    }
  }

  ctx.effect(() => {
    startWatcher();
    return () => {
      const running = child;
      child = undefined;
      if (running) {
        try {
          running.kill();
        } catch (error) {
          /* the watcher may already have exited */
        }
      }
    };
  });

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: ROUTE_PATH,
      resource: async (request, peer) => {
        if (!peer || !peer.principal || peer.principal.kind !== 'owner') {
          return jsonResponse(403, { error: 'forbidden' });
        }
        const url = new URL(request.url);
        paused = url.searchParams.get('paused') === '1';
        const since = Number(url.searchParams.get('since') || '0');
        const fresh = Number.isFinite(since) ? entries.filter((entry) => entry.ts > since) : entries;
        return jsonResponse(200, { now: Date.now(), paused, entries: fresh });
      },
    })
  );
}

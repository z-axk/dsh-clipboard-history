window.__ModuleLoader__.load({
  id: '@local/clipboard-history',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-clipboard-history';
    const STORAGE_KEY = 'dsh.clipboard-history.v1';
    const MAX_ENTRIES = 200;
    const MAX_TEXT_LENGTH = 20000;
    const CONFIRM_CLEAR_MS = 3000;
    const NOTICE_MS = 2200;
    const PAUSE_KEY = 'dsh.clipboard-history.paused';
    const SYNC_ROUTE = '/dsh-clipboard-history/latest';
    const SYNC_INTERVAL_MS = 1500;

    const ZH = {
      title: '剪贴板历史',
      open: '打开剪贴板历史',
      close: '关闭剪贴板历史',
      search: '搜索已复制的内容',
      empty: '还没有记录。在 DSH 中复制文本后会出现在这里。',
      noMatches: '没有匹配的条目。',
      clearAll: '清空',
      confirmClear: '确认清空',
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败',
      pin: '固定',
      unpin: '取消固定',
      remove: '删除',
      count: '条',
      countOne: '条',
      confirmDelete: '确认删除',
      pauseCapture: '暂停记录',
      resumeCapture: '恢复记录',
      pausedHint: '已暂停记录',
      hint: '保存在当前浏览器 · 最多 200 条 · 其他应用复制的文字会自动收录',
    };

    const DICTS = {
      en: {
        title: 'Clipboard history',
        open: 'Open clipboard history',
        close: 'Close clipboard history',
        search: 'Search copied text',
        empty: 'Nothing copied yet. Text you copy inside DSH appears here.',
        noMatches: 'No entries match your search.',
        clearAll: 'Clear all',
        confirmClear: 'Confirm clear',
        copy: 'Copy',
        copied: 'Copied',
        copyFailed: 'Copy failed',
        pin: 'Pin',
        unpin: 'Unpin',
        remove: 'Delete',
        count: 'entries',
        countOne: 'entry',
        confirmDelete: 'Confirm delete',
        pauseCapture: 'Pause recording',
        resumeCapture: 'Resume recording',
        pausedHint: 'Recording paused',
        hint: 'Saved in this browser · up to 200 entries · text copied in other apps is captured too',
      },
      zh: ZH,
      'zh-CN': ZH,
    };

    const CSS = [
      '.dshclip-footer {',
      '  display: flex; align-items: center; gap: 8px; width: 100%; min-width: 0;',
      '  height: 32px; padding: 0 8px; border: 0; border-radius: 8px;',
      '  background: transparent; color: var(--dsw-alias-label-secondary);',
      '  font: inherit; font-size: 13px; line-height: 20px; text-align: left; cursor: pointer;',
      '}',
      '.dshclip-footer:hover,',
      '.dshclip-footer[aria-expanded="true"] {',
      '  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);',
      '}',
      '.dshclip-footer:focus-visible {',
      '  outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px;',
      '}',
      '.dshclip-footer-icon { flex: 0 0 auto; }',
      '.dshclip-footer-rail { justify-content: center; gap: 0; padding: 0; }',
      '.dshclip-footer-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.dshclip-panel {',
      '  position: fixed; left: 16px; bottom: 64px; z-index: 90;',
      '  display: flex; flex-direction: column;',
      '  width: min(380px, calc(100vw - 24px)); max-height: min(64vh, 560px);',
      '  overflow: hidden;',
      '  border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px;',
      '  background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary);',
      '  box-shadow: 0 12px 32px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);',
      '  pointer-events: auto; font-size: 13px;',
      '}',
      '.dshclip-panel:focus { outline: none; }',
      '.dshclip-header {',
      '  display: flex; align-items: center; justify-content: space-between; gap: 8px;',
      '  padding: 10px 10px 6px 12px;',
      '}',
      '.dshclip-heading { display: flex; align-items: baseline; gap: 6px; min-width: 0; }',
      '.dshclip-title { font-weight: 600; font-size: 13px; }',
      '.dshclip-count { color: var(--dsw-alias-label-tertiary); font-size: 11px; white-space: nowrap; }',
      '.dshclip-text-button {',
      '  border: 0; background: transparent; color: var(--dsw-alias-label-secondary);',
      '  font: inherit; font-size: 12px; padding: 4px 8px; border-radius: 6px;',
      '  cursor: pointer; white-space: nowrap;',
      '}',
      '.dshclip-text-button:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }',
      '.dshclip-text-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }',
      '.dshclip-text-button:disabled { opacity: 0.45; cursor: default; background: transparent; }',
      '.dshclip-text-button-danger { color: var(--dsw-alias-state-error-primary); }',
      '.dshclip-search-row { padding: 2px 10px 8px 12px; }',
      '.dshclip-search {',
      '  width: 100%; box-sizing: border-box; height: 30px; padding: 0 10px;',
      '  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;',
      '  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);',
      '  font: inherit; font-size: 12px;',
      '}',
      '.dshclip-search::placeholder { color: var(--dsw-alias-label-tertiary); }',
      '.dshclip-search:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; border-color: transparent; }',
      '.dshclip-list {',
      '  display: flex; flex-direction: column; gap: 2px; min-height: 0;',
      '  overflow-y: auto; padding: 0 6px 6px;',
      '}',
      '.dshclip-entry { display: flex; align-items: flex-start; gap: 4px; padding: 6px 4px 6px 8px; border-radius: 8px; }',
      '.dshclip-entry:hover { background: var(--dsw-alias-bg-layer-2); }',
      '.dshclip-entry-pinned { box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary); }',
      '.dshclip-entry-main {',
      '  flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;',
      '  padding: 0; border: 0; background: transparent; color: inherit;',
      '  font: inherit; text-align: left; cursor: pointer;',
      '}',
      '.dshclip-entry-main:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; border-radius: 4px; }',
      '.dshclip-entry-text {',
      '  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3;',
      '  overflow: hidden; white-space: pre-wrap; overflow-wrap: anywhere;',
      '  font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-primary);',
      '}',
      '.dshclip-entry-time { color: var(--dsw-alias-label-tertiary); font-size: 11px; }',
      '.dshclip-entry-actions { display: flex; flex-direction: column; gap: 2px; flex: 0 0 auto; }',
      '.dshclip-icon-button {',
      '  display: grid; place-items: center; width: 24px; height: 24px; padding: 0;',
      '  border: 0; border-radius: 6px; background: transparent;',
      '  color: var(--dsw-alias-label-tertiary); cursor: pointer;',
      '}',
      '.dshclip-icon-button:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }',
      '.dshclip-icon-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }',
      '.dshclip-icon-button-active { color: var(--dsw-alias-brand-primary); }',
      '.dshclip-empty { padding: 26px 18px; color: var(--dsw-alias-label-tertiary); text-align: center; font-size: 12px; line-height: 1.7; }',
      '.dshclip-status {',
      '  display: flex; align-items: center; min-height: 30px; padding: 6px 12px;',
      '  border-top: 1px solid var(--dsw-alias-border-l1);',
      '  color: var(--dsw-alias-label-tertiary); font-size: 11px;',
      '}',
      '.dshclip-notice { color: var(--dsw-alias-state-success-primary); }',
      '.dshclip-notice-error { color: var(--dsw-alias-state-error-primary); }',
      '.dshclip-hint { color: var(--dsw-alias-label-tertiary); }',
    ].join('\n');

    function makeId() {
      return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    function readSelectionText() {
      try {
        const active = document.activeElement;
        if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
          const start = typeof active.selectionStart === 'number' ? active.selectionStart : 0;
          const end = typeof active.selectionEnd === 'number' ? active.selectionEnd : 0;
          if (end > start) return active.value.slice(start, end);
        }
      } catch (error) {
        /* fall through to the document selection */
      }
      try {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
      } catch (error) {
        return '';
      }
    }

    function readPaused() {
      try {
        return window.localStorage.getItem(PAUSE_KEY) === '1';
      } catch (error) {
        return false;
      }
    }

    function readStoredEntries() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.entries) ? parsed.entries : [];
        const entries = [];
        for (const item of list) {
          if (!item || typeof item.text !== 'string') continue;
          const text = item.text.replace(/\r\n/g, '\n').trim().slice(0, MAX_TEXT_LENGTH);
          if (!text) continue;
          entries.push({
            id: typeof item.id === 'string' && item.id ? item.id : makeId(),
            text,
            ts: typeof item.ts === 'number' && Number.isFinite(item.ts) ? item.ts : Date.now(),
            pinned: item.pinned === true,
          });
          if (entries.length >= MAX_ENTRIES) break;
        }
        return entries;
      } catch (error) {
        return [];
      }
    }

    const dateFormatters = new Map();

    function formatTimestamp(ts, localeId) {
      const id = localeId || 'en';
      try {
        let formatter = dateFormatters.get(id);
        if (!formatter) {
          formatter = new Intl.DateTimeFormat(id, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          });
          dateFormatters.set(id, formatter);
        }
        return formatter.format(new Date(ts));
      } catch (error) {
        try {
          return new Date(ts).toLocaleString();
        } catch (ignored) {
          return '';
        }
      }
    }

    function createStore() {
      let entries = readStoredEntries();
      let open = false;
      let paused = readPaused();
      const listeners = new Set();

      function emit() {
        const current = Array.from(listeners);
        for (let i = 0; i < current.length; i += 1) {
          try {
            current[i]();
          } catch (error) {
            console.error('[clipboard-history] listener failed', error);
          }
        }
      }

      function persist() {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries }));
            return;
          } catch (error) {
            if (entries.length <= 10) return;
            entries = entries.slice(0, Math.max(10, Math.floor(entries.length / 2)));
          }
        }
      }

      function trim() {
        if (entries.length > MAX_ENTRIES) entries = entries.slice(0, MAX_ENTRIES);
      }

      return {
        getEntries() {
          return entries;
        },
        isOpen() {
          return open;
        },
        isPaused() {
          return paused;
        },
        setPaused(next) {
          const value = next === true;
          if (paused === value) return;
          paused = value;
          try {
            window.localStorage.setItem(PAUSE_KEY, value ? '1' : '0');
          } catch (error) {
            /* the pause preference is best effort */
          }
          emit();
        },
        setOpen(next) {
          const value = next === true;
          if (open === value) return;
          open = value;
          emit();
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        add(raw, timestamp) {
          if (typeof raw !== 'string') return;
          const text = raw.replace(/\r\n/g, '\n').trim().slice(0, MAX_TEXT_LENGTH);
          if (!text) return;
          const now = typeof timestamp === 'number' && Number.isFinite(timestamp) ? timestamp : Date.now();
          const existing = entries.find((entry) => entry.text === text);
          if (existing) {
            existing.ts = Math.max(now, existing.ts);
            entries = [existing].concat(entries.filter((entry) => entry !== existing));
          } else {
            entries = [{ id: makeId(), text, ts: now, pinned: false }].concat(entries);
          }
          trim();
          persist();
          emit();
        },
        togglePin(id) {
          const index = entries.findIndex((item) => item.id === id);
          if (index < 0) return;
          entries = entries.map((item, i) => (i === index ? { ...item, pinned: !item.pinned } : item));
          persist();
          emit();
        },
        remove(id) {
          entries = entries.filter((entry) => entry.id !== id);
          persist();
          emit();
        },
        clear() {
          if (entries.length === 0) return;
          entries = [];
          persist();
          emit();
        },
        reload() {
          entries = readStoredEntries();
          emit();
        },
      };
    }

    return {
      inject: ['slots', 'locale', 'timer'],
      apply(ctx) {
        const timer = ctx.get('timer');
        const locale = ctx.get('locale');
        const slots = ctx.get('slots');
        const store = createStore();
        const t = locale.bind(NS);

        ctx.effect(() => locale.register(NS, 'en', DICTS.en));
        ctx.effect(() => locale.register(NS, 'zh', DICTS.zh));
        ctx.effect(() => locale.register(NS, 'zh-CN', DICTS['zh-CN']));

        function schedule(fn, delay) {
          const dispose = timer.timeout(fn, delay);
          return typeof dispose === 'function' ? dispose : () => {};
        }

        let skipCapture = false;

        ctx.effect(() => {
          const disposers = [];

          const onCopy = (event) => {
            if (event.defaultPrevented) return;
            let text = '';
            try {
              text = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
            } catch (error) {
              text = '';
            }
            if (!text) text = readSelectionText();
            if (store.isPaused()) return;
            store.add(text);
          };
          document.addEventListener('copy', onCopy);
          document.addEventListener('cut', onCopy);
          disposers.push(() => {
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('cut', onCopy);
          });

          try {
            const clipboard = navigator.clipboard;
            if (clipboard && typeof clipboard.writeText === 'function') {
              const original = clipboard.writeText;
              const wrapped = function writeText(text) {
                const result = original.call(clipboard, text);
                if (skipCapture) {
                  skipCapture = false;
                  return result;
                }
                const record = () => {
                  if (store.isPaused()) return;
                  try {
                    store.add(text);
                  } catch (error) {
                    /* ignore */
                  }
                };
                if (result && typeof result.then === 'function') {
                  result.then(record, () => {});
                } else {
                  record();
                }
                return result;
              };
              Object.defineProperty(clipboard, 'writeText', {
                configurable: true,
                writable: true,
                value: wrapped,
              });
              disposers.push(() => {
                try {
                  if (clipboard.writeText === wrapped) delete clipboard.writeText;
                } catch (error) {
                  try {
                    clipboard.writeText = original;
                  } catch (ignored) {
                    /* ignore */
                  }
                }
              });
            }
          } catch (error) {
            /* clipboard writes are only a secondary capture path */
          }

          const onStorage = (event) => {
            if (event.key === STORAGE_KEY) store.reload();
          };
          window.addEventListener('storage', onStorage);
          disposers.push(() => window.removeEventListener('storage', onStorage));

          return () => {
            for (let i = 0; i < disposers.length; i += 1) {
              try {
                disposers[i]();
              } catch (error) {
                /* ignore */
              }
            }
          };
        });

        let lastRemoteTs = 0;
        let routeAvailable = true;

        async function readSystemClipboard() {
          if (store.isPaused()) return;
          try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) store.add(text);
          } catch (error) {
            /* the browser may refuse clipboard reads without focus or permission */
          }
        }

        async function pullSystemClipboard() {
          const pausedNow = store.isPaused();
          try {
            const response = await fetch(
              SYNC_ROUTE + '?since=' + lastRemoteTs + '&paused=' + (pausedNow ? '1' : '0'),
              { headers: { accept: 'application/json' }, cache: 'no-store' }
            );
            if (!response.ok) throw new Error('HTTP ' + response.status);
            routeAvailable = true;
            const payload = await response.json();
            if (pausedNow) return;
            const list = payload && Array.isArray(payload.entries) ? payload.entries : [];
            for (let i = 0; i < list.length; i += 1) {
              const item = list[i];
              if (!item || typeof item.text !== 'string') continue;
              if (typeof item.ts === 'number' && item.ts > lastRemoteTs) lastRemoteTs = item.ts;
              store.add(item.text, item.ts);
            }
          } catch (error) {
            routeAvailable = false;
          }
        }

        async function refreshFromSystemClipboard() {
          await pullSystemClipboard();
          if (!routeAvailable) await readSystemClipboard();
        }

        ctx.effect(() => {
          const stopInterval = timer.interval(() => {
            if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
            void pullSystemClipboard();
          }, SYNC_INTERVAL_MS);
          const onFocus = () => {
            void refreshFromSystemClipboard();
          };
          const onVisibility = () => {
            if (document.visibilityState === 'visible') void refreshFromSystemClipboard();
          };
          window.addEventListener('focus', onFocus);
          document.addEventListener('visibilitychange', onVisibility);
          return () => {
            stopInterval();
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
          };
        });

        function useEntries() {
          const [entries, setEntries] = React.useState(() => store.getEntries());
          React.useEffect(() => store.subscribe(() => setEntries(store.getEntries())), []);
          return entries;
        }

        function useOpen() {
          const [open, setOpenState] = React.useState(() => store.isOpen());
          React.useEffect(() => store.subscribe(() => setOpenState(store.isOpen())), []);
          return open;
        }

        function useLocale() {
          const [snapshot, setSnapshot] = React.useState(() => locale.getSnapshot());
          React.useEffect(() => locale.subscribe(() => setSnapshot(locale.getSnapshot())), []);
          return snapshot;
        }

        function usePaused() {
          const [paused, setPausedState] = React.useState(() => store.isPaused());
          React.useEffect(() => store.subscribe(() => setPausedState(store.isPaused())), []);
          return paused;
        }

        function ClipboardIcon(props) {
          const size = props.size || 18;
          return h('svg', {
            className: props.className,
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            'aria-hidden': 'true',
          },
            h('rect', {
              x: 6, y: 4.5, width: 12, height: 16, rx: 2.4,
              stroke: 'currentColor', strokeWidth: 1.6,
            }),
            h('path', {
              d: 'M9.4 4.5V3.7c0-.9.7-1.6 1.6-1.6h1.9c.9 0 1.6.7 1.6 1.6v.8',
              stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
            }),
            h('path', {
              d: 'M9.5 10h5M9.5 13.5h5M9.5 17h3',
              stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
            })
          );
        }

        function PinIcon() {
          return h('svg', {
            width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true',
          },
            h('path', { d: 'M9 3.5h6', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
            h('path', {
              d: 'M10 3.5v5.2L7.6 12.2c-.5.6-.05 1.6.75 1.6h7.3c.8 0 1.25-1 .75-1.6L14 8.7V3.5',
              stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round',
            }),
            h('path', { d: 'M12 13.8V20.5', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })
          );
        }

        function TrashIcon() {
          return h('svg', {
            width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true',
          },
            h('path', {
              d: 'M4.5 7h15M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M7 7l.8 11.1c.1 1 .9 1.9 2 1.9h4.4c1.1 0 1.9-.9 2-1.9L17 7',
              stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
            }),
            h('path', { d: 'M10 11v5M14 11v5', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })
          );
        }

        function PauseIcon() {
          return h('svg', {
            width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true',
          },
            h('rect', { x: 7, y: 5.5, width: 3.4, height: 13, rx: 1.2, fill: 'currentColor' }),
            h('rect', { x: 13.6, y: 5.5, width: 3.4, height: 13, rx: 1.2, fill: 'currentColor' })
          );
        }

        function PlayIcon() {
          return h('svg', {
            width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true',
          },
            h('path', { d: 'M8 5.5v13l10-6.5-10-6.5z', fill: 'currentColor' })
          );
        }

        function StyleTag() {
          return h('style', { key: 'dshclip-styles', 'data-dsh-plugin': 'clipboard-history' }, CSS);
        }

        function FooterAction(props) {
          const wide = props.wide !== false;
          const open = useOpen();
          useLocale();
          return h(React.Fragment, { key: 'dshclip-footer' },
            h(StyleTag),
            h('button', {
            id: 'dshclip-footer-button',
            type: 'button',
            className: wide ? 'dshclip-footer' : 'dshclip-footer dshclip-footer-rail',
            title: open ? t('close') : t('open'),
            'aria-label': open ? t('close') : t('open'),
            'aria-expanded': open,
            'aria-haspopup': 'dialog',
            'aria-controls': 'dshclip-panel',
            onClick: () => store.setOpen(!store.isOpen()),
          },
            h(ClipboardIcon, { size: 18, className: 'dshclip-footer-icon' }),
            wide ? h('span', { className: 'dshclip-footer-label' }, t('title')) : null
          )
          );
        }

        function Panel() {
          const entries = useEntries();
          const open = useOpen();
          const paused = usePaused();
          const localeSnapshot = useLocale();
          const [query, setQuery] = React.useState('');
          const [confirmClear, setConfirmClear] = React.useState(false);
          const [pendingDelete, setPendingDelete] = React.useState(null);
          const [notice, setNotice] = React.useState(null);
          const [anchor, setAnchor] = React.useState(null);
          const panelRef = React.useRef(null);
          const inputRef = React.useRef(null);
          const confirmTimerRef = React.useRef(null);
          const deleteTimerRef = React.useRef(null);
          const noticeTimerRef = React.useRef(null);
          const wasOpenRef = React.useRef(false);

          React.useEffect(() => {
            if (!open) {
              setQuery('');
              setConfirmClear(false);
              setPendingDelete(null);
              setNotice(null);
              if (wasOpenRef.current) {
                wasOpenRef.current = false;
                const trigger = document.getElementById('dshclip-footer-button');
                if (trigger && typeof trigger.focus === 'function') trigger.focus();
              }
              return undefined;
            }
            wasOpenRef.current = true;
            const measure = () => {
              const trigger = document.getElementById('dshclip-footer-button');
              const rect = trigger && typeof trigger.getBoundingClientRect === 'function'
                ? trigger.getBoundingClientRect()
                : null;
              if (rect) setAnchor({ left: rect.left, bottom: rect.bottom, top: rect.top });
              else setAnchor(null);
            };
            measure();
            window.addEventListener('resize', measure);
            const focusTimer = schedule(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 20);
            return () => {
              focusTimer();
              window.removeEventListener('resize', measure);
            };
          }, [open]);

          React.useEffect(() => () => {
            if (noticeTimerRef.current) {
              noticeTimerRef.current();
              noticeTimerRef.current = null;
            }
            if (confirmTimerRef.current) {
              confirmTimerRef.current();
              confirmTimerRef.current = null;
            }
            if (deleteTimerRef.current) {
              deleteTimerRef.current();
              deleteTimerRef.current = null;
            }
          }, []);

          React.useEffect(() => {
            if (!open) return undefined;
            const onKeyDown = (event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                store.setOpen(false);
                return;
              }
              if (event.key !== 'Tab') return;
              const panel = panelRef.current;
              if (!panel || typeof panel.querySelectorAll !== 'function') return;
              const focusables = Array.prototype.filter.call(
                panel.querySelectorAll(
                  'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
                ),
                (element) => !element.disabled
              );
              const count = focusables.length;
              if (count === 0) return;
              const first = focusables[0];
              const last = focusables[count - 1];
              const active = document.activeElement;
              if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
              }
            };
            const onPointerDown = (event) => {
              const target = event.target;
              const panel = panelRef.current;
              if (panel && target && typeof panel.contains === 'function' && panel.contains(target)) return;
              if (target && typeof target.closest === 'function' && target.closest('.dshclip-footer')) return;
              store.setOpen(false);
            };
            document.addEventListener('keydown', onKeyDown, true);
            document.addEventListener('mousedown', onPointerDown, true);
            return () => {
              document.removeEventListener('keydown', onKeyDown, true);
              document.removeEventListener('mousedown', onPointerDown, true);
            };
          }, [open]);

          const flash = (message, ok) => {
            setNotice({ message, ok });
            if (noticeTimerRef.current) {
              noticeTimerRef.current();
              noticeTimerRef.current = null;
            }
            noticeTimerRef.current = schedule(() => {
              setNotice(null);
              noticeTimerRef.current = null;
            }, NOTICE_MS);
          };

          const copyEntry = (text) => {
            skipCapture = true;
            try {
              const result = navigator.clipboard.writeText(text);
              skipCapture = false;
              if (result && typeof result.then === 'function') {
                result.then(() => flash(t('copied'), true), () => flash(t('copyFailed'), false));
              } else {
                flash(t('copied'), true);
              }
            } catch (error) {
              skipCapture = false;
              flash(t('copyFailed'), false);
            }
          };

          const handleDelete = (id) => {
            if (pendingDelete !== id) {
              setPendingDelete(id);
              if (deleteTimerRef.current) deleteTimerRef.current();
              deleteTimerRef.current = schedule(() => {
                setPendingDelete(null);
                deleteTimerRef.current = null;
              }, CONFIRM_CLEAR_MS);
              return;
            }
            if (deleteTimerRef.current) {
              deleteTimerRef.current();
              deleteTimerRef.current = null;
            }
            setPendingDelete(null);
            store.remove(id);
          };

          const handleClear = () => {
            if (entries.length === 0) return;
            if (!confirmClear) {
              setConfirmClear(true);
              if (confirmTimerRef.current) confirmTimerRef.current();
              confirmTimerRef.current = schedule(() => {
                setConfirmClear(false);
                confirmTimerRef.current = null;
              }, CONFIRM_CLEAR_MS);
              return;
            }
            if (confirmTimerRef.current) {
              confirmTimerRef.current();
              confirmTimerRef.current = null;
            }
            setConfirmClear(false);
            store.clear();
          };

          if (!open) return null;

          const sorted = entries.slice().sort((a, b) => {
            const pinDelta = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
            return pinDelta !== 0 ? pinDelta : b.ts - a.ts;
          });
          const needle = query.trim().toLowerCase();
          const visible = needle
            ? sorted.filter((entry) => entry.text.toLowerCase().indexOf(needle) >= 0)
            : sorted;

          const renderEntry = (entry) => h('div', {
            key: entry.id,
            className: entry.pinned ? 'dshclip-entry dshclip-entry-pinned' : 'dshclip-entry',
          },
            h('button', {
              type: 'button',
              className: 'dshclip-entry-main',
              title: t('copy'),
              'aria-label': t('copy'),
              onClick: () => copyEntry(entry.text),
            },
              h('span', { className: 'dshclip-entry-text' }, entry.text),
              h('span', { className: 'dshclip-entry-time' }, formatTimestamp(entry.ts, localeSnapshot.active))
            ),
            h('div', { className: 'dshclip-entry-actions' },
              h('button', {
                type: 'button',
                className: entry.pinned
                  ? 'dshclip-icon-button dshclip-icon-button-active'
                  : 'dshclip-icon-button',
                title: entry.pinned ? t('unpin') : t('pin'),
                'aria-label': entry.pinned ? t('unpin') : t('pin'),
                'aria-pressed': entry.pinned,
                onClick: () => store.togglePin(entry.id),
              }, h(PinIcon, null)),
              h('button', {
                type: 'button',
                className: pendingDelete === entry.id
                  ? 'dshclip-text-button dshclip-text-button-danger'
                  : 'dshclip-icon-button',
                title: pendingDelete === entry.id ? t('confirmDelete') : t('remove'),
                'aria-label': pendingDelete === entry.id ? t('confirmDelete') : t('remove'),
                onClick: () => handleDelete(entry.id),
              }, pendingDelete === entry.id ? t('confirmDelete') : h(TrashIcon, null))
            )
          );

          const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth;
          const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;
          const panelWidth = Math.min(380, Math.max(240, viewportWidth - 24));
          const panelMaxHeight = Math.min(560, Math.max(200, viewportHeight - 16));
          const panelTop = Math.max(
            8,
            Math.min(anchor ? anchor.top - panelMaxHeight - 8 : 8, viewportHeight - panelMaxHeight - 8),
          );
          const panelStyle = anchor
            ? {
              left: Math.max(8, Math.min(anchor.left, viewportWidth - panelWidth - 8)) + 'px',
              top: panelTop + 'px',
              bottom: 'auto',
              maxHeight: panelMaxHeight + 'px',
            }
            : undefined;

          return h('div', {
            ref: panelRef,
            id: 'dshclip-panel',
            className: 'dshclip-panel',
            style: panelStyle || { visibility: 'hidden' },
            role: 'dialog',
            'aria-modal': true,
            'aria-label': t('title'),
            tabIndex: -1,
          },
            h('div', { className: 'dshclip-header' },
              h('div', { className: 'dshclip-heading' },
                h('span', { className: 'dshclip-title' }, t('title')),
                h('span', { className: 'dshclip-count' },
                  visible.length + ' ' + (visible.length === 1 ? t('countOne') : t('count')))
              ),
              h('button', {
                type: 'button',
                className: paused
                  ? 'dshclip-icon-button dshclip-icon-button-active'
                  : 'dshclip-icon-button',
                title: paused ? t('resumeCapture') : t('pauseCapture'),
                'aria-label': paused ? t('resumeCapture') : t('pauseCapture'),
                'aria-pressed': paused,
                onClick: () => store.setPaused(!store.isPaused()),
              }, paused ? h(PlayIcon, null) : h(PauseIcon, null)),
              h('button', {
                type: 'button',
                className: confirmClear
                  ? 'dshclip-text-button dshclip-text-button-danger'
                  : 'dshclip-text-button',
                disabled: entries.length === 0,
                onClick: handleClear,
              }, confirmClear ? t('confirmClear') : t('clearAll'))
            ),
            h('div', { className: 'dshclip-search-row' },
              h('input', {
                ref: inputRef,
                className: 'dshclip-search',
                type: 'search',
                value: query,
                placeholder: t('search'),
                'aria-label': t('search'),
                onChange: (event) => setQuery(event.target.value),
              })
            ),
            h('div', { className: 'dshclip-list' },
              visible.length === 0
                ? h('div', { className: 'dshclip-empty' }, needle ? t('noMatches') : t('empty'))
                : visible.map(renderEntry)
            ),
            h('div', { className: 'dshclip-status', role: 'status' },
              notice
                ? h('span', {
                  className: notice.ok ? 'dshclip-notice' : 'dshclip-notice dshclip-notice-error',
                }, notice.message)
                : paused
                  ? h('span', { className: 'dshclip-hint' }, t('pausedHint'))
                  : h('span', { className: 'dshclip-hint' }, t('hint'))
            )
          );
        }

        slots.inject('sidebar.footer.action', () => slots.register({
          name: 'sidebar.footer.action',
          id: 'clipboard-history',
          order: 10,
          label: () => t('title'),
        }, FooterAction));

        slots.inject('shell.overlay', () => slots.register({
          name: 'shell.overlay',
          id: 'clipboard-history-panel',
          order: 30,
        }, Panel));
      },
    };
  },
});

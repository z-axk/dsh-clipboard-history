/**
 * Host half of the clipboard history plugin.
 *
 * The whole feature lives in the Web client: copies are captured from DOM
 * events and the history is persisted in the browser's localStorage. The Host
 * therefore only needs to exist so the bundle can register its client half.
 */
export function apply() {}

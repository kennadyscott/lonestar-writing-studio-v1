// Client for the learning-path library.
//
// One shared workspace key, held in sessionStorage — it is gone when the tab
// closes, and it is never written into the bundle. Every call carries it; the
// student-facing /live route does not need it.

const PORT = typeof location !== 'undefined' ? location.port : ''
const BASE = PORT === '5173' ? '' : PORT === '4200' ? 'http://localhost:8788' : ''

const KEY = 'studioWorkspaceKey'
export const getKey = () => { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } }
export const setKey = (k) => { try { k ? sessionStorage.setItem(KEY, k) : sessionStorage.removeItem(KEY) } catch {} }

async function call(method, path, body) {
  const r = await fetch(BASE + '/api/library' + path, {
    method,
    headers: { 'content-type': 'application/json', 'x-studio-key': getKey() },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let json = {}
  try { json = await r.json() } catch {}
  if (!r.ok) { const e = new Error(json.error || `Request failed (${r.status})`); e.status = r.status; e.payload = json; throw e }
  return json
}

export const library = {
  meta: () => call('GET', '/meta'),
  live: () => call('GET', '/live'),
  list: () => call('GET', '/paths'),
  get: (id) => call('GET', `/paths/${id}`),
  create: (topic) => call('POST', '/paths', { topic }),
  save: (id, topic) => call('PUT', `/paths/${id}`, { topic }),
  remove: (id) => call('DELETE', `/paths/${id}`),
  publish: (id, note) => call('POST', `/paths/${id}/publish`, { note }),
  unpublish: (id) => call('POST', `/paths/${id}/unpublish`),
  setStage: (id, stage) => call('POST', `/paths/${id}/stage`, { stage }),
  restore: (id, version) => call('POST', `/paths/${id}/restore`, { version }),
  seed: (overwrite) => call('POST', '/seed', { overwrite: !!overwrite }),
  createTopic: (topic) => call('POST', '/seed', { topics: [topic], overwrite: true }),
  saveArt: (images) => call('POST', '/art', { images }),
  standards: (q = {}) => call('GET', '/core/standards?' + new URLSearchParams(
    Object.entries(q).filter(([, v]) => v !== '' && v != null)).toString()),
}

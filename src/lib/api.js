import { localApi } from './localBackend.js'

const j = (r) => r.json()

// Where the API lives, depending on how the app is served:
//  - Vite dev (:5173)         -> '' (Vite proxies /api to the backend)
//  - local static preview (:4200, python) -> the separate Node API on :8788
//  - everything else (Node serving app+API on one port, or a deployed host / tunnel)
//    -> same origin, relative
const PORT = typeof location !== 'undefined' ? location.port : ''
const BASE = PORT === '5173' ? '' : PORT === '4200' ? 'http://localhost:8788' : ''
const u = (p) => BASE + p

const networkApi = {
  health: () => fetch(u('/api/health')).then(j),
  state: () => fetch(u('/api/state')).then(j),
  reset: () => fetch(u('/api/reset'), { method: 'POST' }).then(j),
  saveContent: (draftId, content) =>
    fetch(u(`/api/drafts/${draftId}`), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) }).then(j),
  traits: (draftId) => fetch(u(`/api/drafts/${draftId}/traits`), { method: 'POST' }).then(j),
  confer: (subId, message) =>
    fetch(u(`/api/submissions/${subId}/conference`), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) }).then(j),
  saveRevision: (subId) => fetch(u(`/api/submissions/${subId}/save-revision`), { method: 'POST' }).then(j),
  quickWrite: (mode, extra = {}) => fetch(u('/api/quickwrite'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, ...extra }) }).then(j),
  start: (assignmentId) => fetch(u('/api/submissions/start'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ assignmentId }) }).then(j),
  setGoal: (payload) => fetch(u('/api/goal'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
  achieveGoal: () => fetch(u('/api/goal/achieve'), { method: 'POST' }).then(j),
  peerRevision: () => fetch(u('/api/peerrevision'), { method: 'POST' }).then(j),
  evaluate: (subId, answers) => fetch(u(`/api/submissions/${subId}/evaluate`), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers }) }).then(j),
  submitRevision: (subId) => fetch(u(`/api/submissions/${subId}/submit-revision`), { method: 'POST' }).then(j),
  publish: (subId) => fetch(u(`/api/submissions/${subId}/publish`), { method: 'POST' }).then(j),
  discard: (subId) => fetch(u(`/api/submissions/${subId}/discard`), { method: 'POST' }).then(j),
  share: (submissionId) => fetch(u('/api/share'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ submissionId }) }).then(j),
  proofContent: () => fetch(u('/api/proof/content')).then(j),
  saveTopic: (topic) => fetch(u('/api/proof/topic'), { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic }) }).then(j),
  revertProof: () => fetch(u('/api/proof/revert'), { method: 'POST' }).then(j),
  drillFinish: (payload) => fetch(u('/api/drill/finish'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
  typingFinish: (payload) => fetch(u('/api/typing/finish'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
  react: (id, type) => fetch(u(`/api/share/${id}/react`), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type }) }).then(j),
  shoutOut: (payload) => fetch(u('/api/shoutout'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
}

// VITE_STATIC=1 builds (e.g. GitHub Pages) have no server — run everything in-browser.
export const api = import.meta.env.VITE_STATIC === '1' ? localApi : networkApi

export const TRAIT_LABELS = {
  ideas: 'Ideas', organization: 'Organization', voice: 'Voice',
  word_choice: 'Word Choice', sentence_fluency: 'Sentence Fluency', conventions: 'Conventions',
}
export const LEVEL_NAMES = { 1: 'Emerging', 2: 'Developing', 3: 'Proficient', 4: 'Strong' }
// Sequential ramp — levels are ordered magnitude, one hue light→dark.
export const LEVEL_COLORS = { 1: '#c5dccd', 2: '#8fcba4', 3: '#4aa96c', 4: '#1e7a4a' }

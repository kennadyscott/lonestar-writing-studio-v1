// Vercel front door for the library.
//
// Routed by an explicit rewrite in vercel.json rather than a [...catch-all]
// filename: on a project with a custom buildCommand, Vercel resolved the
// catch-all as a single dynamic segment, so /api/library reached the function
// and /api/library/live did not. The rewrite hands the rest of the path over as
// ?path=, and this rebuilds the pathname the router expects.
//
// Thin on purpose: the routing, the proofing and the publish gate all live in
// lib/server, which the local Node server runs too, so there is exactly one
// implementation to trust.
import { libraryRoute } from '../lib/server/library.mjs'
import { authorized } from '../lib/server/auth.mjs'

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'http://x')
  const rest = (url.searchParams.get('path') || '').replace(/^\/+/, '')
  const pathname = '/api/library' + (rest ? '/' + rest : '')

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  try {
    const out = await libraryRoute({
      method: req.method, pathname, body: body || {}, authorized: authorized(req.headers),
    })
    res.status(out.status).json(out.json)
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
}

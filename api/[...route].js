// Vercel front door for the library. Thin on purpose: the routing, the proofing
// and the publish gate all live in lib/server, which the local Node server runs
// too, so there is exactly one implementation to trust.
import { libraryRoute } from '../lib/server/library.mjs'
import { authorized } from '../lib/server/auth.mjs'

export default async function handler(req, res) {
  const pathname = (req.url || '').split('?')[0]
  if (!pathname.startsWith('/api/library')) {
    res.status(404).json({ error: 'not found' })
    return
  }
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

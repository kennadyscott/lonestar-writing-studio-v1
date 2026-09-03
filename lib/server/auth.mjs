// One shared workspace key, not user accounts.
//
// The console is a single shared room: anyone who has the key can author and
// approve. That is a deliberate stage — logins and an approval trail come when
// real publishers outnumber the people in the room. What the key does buy,
// cheaply, is that the console is not open to the whole internet, and the key
// itself lives in a server env var and never ships in the browser bundle.
export function authorized(headers = {}) {
  const want = process.env.PUBLISHER_PASSCODE || ''
  if (!want) return true // no key configured — local development
  const got = headers['x-studio-key'] || headers['X-Studio-Key'] || ''
  return String(got) === want
}

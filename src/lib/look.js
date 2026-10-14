// A and B looks for the student pages, to compare a simpler version with today's (Kennady, October 14, 2026: "I just think we need
// to simplify a little bit. Let's start with the homepage. Make me an AB control so I can see what it might look like if the
// assignment buttons was less, less language on the quick write page, etc."). A is today's page; B is the simpler one.
// The choice is kept in this browser and every page reads the same value.
import { useSyncExternalStore } from 'react'

const KEY = 'lscr.look'
const listeners = new Set()
const read = () => { try { return localStorage.getItem(KEY) === 'b' ? 'b' : 'a' } catch { return 'a' } }

export function setLook(look) {
  try { localStorage.setItem(KEY, look === 'b' ? 'b' : 'a') } catch { /* private window: this page only */ }
  current = look === 'b' ? 'b' : 'a'
  listeners.forEach((fn) => fn())
}
let current = read()
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

/** 'a' (today's page) or 'b' (the simpler one). */
export const useLook = () => useSyncExternalStore(subscribe, () => current, () => 'a')

import React, { createContext, useContext, useMemo } from 'react'

/*
 * The Language Bridge level, made ambient.
 *
 * The level is a property of the STUDENT, not of an assignment, so every
 * surface needs it — the Proof Room, the Fluency Zone, the Writing Bank, the
 * dashboard tiles. Passing it down by prop made it an assignment feature by
 * accident: the surfaces that happened to receive it got scaffolding and the
 * rest silently got none. A context is what makes the bridge platform-wide.
 */

const BridgeContext = createContext({ level: null })

export function BridgeProvider({ level, children }) {
  const value = useMemo(() => ({ level: level || null }), [level])
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
}

export function useBridgeLevel() { return useContext(BridgeContext).level }

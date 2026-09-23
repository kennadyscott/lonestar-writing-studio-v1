import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { es } from './es.js'

/*
 * Platform language. English is the source of truth: every call is t('English
 * string'), and the Spanish dictionary is keyed by that English text. Anything
 * not yet translated falls back to English instead of showing a raw key, so a
 * half-translated screen still reads.
 *
 * Interpolation: t('{n} words', { n: 12 }).
 */

const DICTS = { en: null, es }
const STORE_KEY = 'lscr.lang'

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (s) => s })

function translate(dict, key, vars) {
  let out = (dict && dict[key]) || key
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(STORE_KEY) || 'en' } catch { return 'en' }
  })
  const setLang = useCallback((next) => {
    setLangState(next)
    try { localStorage.setItem(STORE_KEY, next) } catch {}
    try { document.documentElement.lang = next } catch {}
  }, [])
  const value = useMemo(() => {
    const dict = DICTS[lang]
    return { lang, setLang, t: (key, vars) => translate(dict, key, vars) }
  }, [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() { return useContext(LangContext) }

// Convenience for components that only need the translator.
export function useT() { return useContext(LangContext).t }

// Dates follow the chosen language. es-MX because the Texas student population
// this serves is predominantly Mexican-American.
export const LOCALES = { en: 'en-US', es: 'es-MX' }
export function useLocale() { return LOCALES[useContext(LangContext).lang] || LOCALES.en }

export const LANGS = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'Español', short: 'ES', flag: '🇲🇽' },
]

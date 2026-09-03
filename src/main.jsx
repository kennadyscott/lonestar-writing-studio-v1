import React from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.jsx'
import Platform from './publisher/Platform.jsx'

// Two surfaces, one bundle:
//   /publisher  Crystal Writing — the publisher console
//   /           the student app
// The hash forms survive static hosts that cannot rewrite paths.
//
// ClearK12 Content Studio used to be a third surface here, which made this
// product look like the owner of data every product reads. It has its own repo
// and its own deployment now; this one reads the shared catalog and never
// writes it.
const at = (name) =>
  new RegExp(`/${name}/?$`).test(location.pathname) ||
  location.hash.replace('#', '').replace('/', '') === name

const root = createRoot(document.getElementById('root'))
root.render(
  at('publisher')
    ? <Platform onExit={() => { location.hash = ''; location.pathname = location.pathname.replace(/\/publisher\/?$/, '/') }} />
    : <App />
)

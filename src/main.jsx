import React from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.jsx'
import Platform from './publisher/Platform.jsx'
import Studio from './studio/Studio.jsx'

// Three surfaces, one bundle, stacked the way the platform is:
//   /studio     ClearK12 Content Studio — standards and the other shared data
//   /publisher  Crystal Writing — one product inside it
//   /           the student app
// The hash forms survive static hosts that cannot rewrite paths.
const at = (name) =>
  new RegExp(`/${name}/?$`).test(location.pathname) ||
  location.hash.replace('#', '').replace('/', '') === name

const root = createRoot(document.getElementById('root'))
root.render(
  at('studio') ? <Studio />
    : at('publisher')
      ? <Platform onExit={() => { location.hash = ''; location.pathname = location.pathname.replace(/\/publisher\/?$/, '/') }} />
      : <App />
)

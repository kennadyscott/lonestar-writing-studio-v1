import React from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.jsx'
import Platform from './publisher/Platform.jsx'

// Two apps, one bundle. /publisher (or #publisher, which survives static hosts
// that cannot rewrite paths) opens the Path Library instead of the student studio.
const publisher = /\/publisher\/?$/.test(location.pathname) || location.hash.replace('#', '').replace('/', '') === 'publisher'

createRoot(document.getElementById('root')).render(
  publisher ? <Platform onExit={() => { location.hash = ''; location.pathname = location.pathname.replace(/\/publisher\/?$/, '/') }} /> : <App />
)

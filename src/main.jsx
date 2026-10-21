import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.jsx'
import Platform from './publisher/Platform.jsx'
import { LangProvider } from './lib/i18n/index.jsx'
import TeacherView from './teacher/TeacherView.jsx'

// Two surfaces, one bundle:
//   /publisher  Crystal Writing — the publisher console
//   /           the student app, and the teacher side at #teacher
// The hash forms survive static hosts that cannot rewrite paths.
//
// ClearK12 Content Studio used to be a third surface here, which made this
// product look like the owner of data every product reads. It has its own repo
// and its own deployment now; this one reads the shared catalog and never
// writes it.
const at = (name) =>
  new RegExp(`/${name}/?$`).test(location.pathname) ||
  location.hash.replace('#', '').replace('/', '') === name

// The account switcher moves between the student app and the teacher side (#teacher, #teacher/progress…).
const isTeacher = () => /^#teacher(\/|$)/.test(location.hash)
const toStudent = () => { history.pushState(null, '', location.pathname + location.search); dispatchEvent(new HashChangeEvent('hashchange')) }
function Accounts() {
  const [teacher, setTeacher] = useState(isTeacher)
  useEffect(() => {
    const on = () => { setTeacher(isTeacher()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return teacher ? <TeacherView onStudent={toStudent} studentLabel="Kayla Scott" /> : <LangProvider><App /></LangProvider>
}

const root = createRoot(document.getElementById('root'))
root.render(
  at('publisher')
    ? <Platform onExit={() => { location.hash = ''; location.pathname = location.pathname.replace(/\/publisher\/?$/, '/') }} />
    : <Accounts />
)

import React, { useEffect, useRef } from 'react'
import css from './teacher.css?inline'
import { BRAND } from '../lib/brand.js'
import { mountTeacher } from './teacherView.js'

const FONTS = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@500&display=swap'

/** The teacher side, reached from the account switcher (#teacher). Fonts load on the page; a shadow root can't load them. */
export default function TeacherView({ onStudent, studentLabel }) {
  const host = useRef(null)
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONTS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONTS
      document.head.appendChild(link)
    }
    const el = host.current
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' })
    return mountTeacher(root, { css, logo: BRAND.logo, onStudent, studentLabel })
  }, [onStudent, studentLabel])
  return <div ref={host} />
}

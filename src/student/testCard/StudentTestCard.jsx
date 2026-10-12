/* eslint-disable @next/next/no-img-element -- the student app's own card, shared word for word with the CMS */
// The student test card: one pre-test or post-test question exactly as a student meets it. Shared word for word with the CMS
// (ck12-CMS-V2 src/components/student-test-card/), where the publisher's preview box is this same card, so nothing is approved that
// looks different to a student (Kennady, October 12, 2026).
//
// The flow is the approved mockup's: answer, Check my answer, then right or "Not quite" with the hint (one try), then Next.
// A tall picture sits beside the question. A wide one sits on top, whole and as large as the question leaves room for (Kennady,
// October 12, 2026: "can we not get this format to sit like this with the whole picture?"). A passage sits beside or above.
// A passage question's picture must be wide and sits above its question, never above the passage; any other shape is not shown
// (Kennady, October 12, 2026: "only allow horizontal layout images and put it above the directions, not above the passage").
// Sized for a Chromebook: --stc-avail is the height below the app's top bar (default: the screen less 94px).
import { useMemo, useState } from 'react'
import { readyToCheck, scoreStudentItem, seededOrder, unnumbered } from './studentTestItem.mjs'
import './studentTestCard.css'

const letter = (i) => String.fromCharCode(65 + i)
const shapeOf = (im) => (im.naturalHeight > im.naturalWidth * 1.1 ? 'tall' : im.naturalWidth > im.naturalHeight * 1.1 ? 'wide' : 'square')

export function StudentTestCard({ item, answer = /** @type {string[]} */ ([]), onAnswer, checked = false, onCheck, eyebrow, title, index = 0, total = 1, progress = /** @type {string[]} */ ([]), onBack, onPrev, onNext, nextLabel = 'Next question', seed = '', previewOnly = false, onShape }) {
  const [shape, setShape] = useState(null)
  const options = useMemo(() => (item.kind === 'hotspot' ? item.options || [] : seededOrder(item.options || [], seed + ':' + item.id)), [item, seed])
  const right = checked && scoreStudentItem(item, answer)
  const ready = readyToCheck(item, answer)
  const set = (next) => { if (!checked && !previewOnly && onAnswer) onAnswer(next) }
  const pic = item.passage ? null : item.picture
  const passagePic = item.passage ? item.picture : null
  const beside = !!pic && (item.layout ? item.layout === 'side' : shape === 'tall')
  // A dropdown question whose own wording holds the blank shows the dropdown in that sentence.
  const inlineInAsk = item.kind === 'inline' && !item.text && /_{2,}/.test(item.prompt || '')
  const measured = (s) => { if (s !== shape) { setShape(s); onShape?.(s) } }
  const media = item.passage ? `with-passage ${item.layout === 'stack' ? 'stack' : 'side'}` : pic ? (beside ? 'beside' : 'above') : ''

  return (
    <article className={'stc' + (pic || item.passage ? ' has-media' : '') + (pic && !beside ? ' stc-above' : '') + (passagePic && shape === 'wide' ? ' stc-qpic-on' : '')}>
      <header className="stc-head">
        {onBack && <button type="button" className="stc-back" onClick={onBack}>← My pathway</button>}
        <div className="stc-title">{eyebrow && <span className="stc-eyebrow">{eyebrow}</span>}<h1>{title}</h1></div>
        {progress.length > 1 && <span className="stc-dots" aria-hidden="true">{progress.map((p, i) => <i key={i} className={p} />)}</span>}
        <span className="stc-count">{index + 1} / {total}</span>
      </header>

      <div className={'stc-body ' + media}>
        {item.passage && (
          <article className="stc-passage" aria-label="Passage">
            <h2>{item.passage.title}</h2>
            {item.passage.paragraphs.map((p, i) => <p key={i}><span className="stc-pn">{i + 1}</span>{unnumbered(p, i)}</p>)}
          </article>
        )}
        {pic && (
          <figure className="stc-figure">
            <img className="stc-pic" src={pic.src} alt={pic.alt || ''} onLoad={(e) => measured(shapeOf(e.currentTarget))} />
          </figure>
        )}
        <div className="stc-q">
          {passagePic && (
            <figure className="stc-qpic" hidden={shape !== 'wide'}>
              <img src={passagePic.src} alt={passagePic.alt || ''} onLoad={(e) => measured(shapeOf(e.currentTarget))} />
            </figure>
          )}
          {inlineInAsk
            ? <h2 className="stc-ask stc-ask-inline">{item.prompt.split(/_{2,}/)[0]}<InlineSelect item={item} options={options} answer={answer} set={set} checked={checked} />{item.prompt.split(/_{2,}/).slice(1).join(' ')}</h2>
            : <h2 className="stc-ask">{item.prompt}</h2>}
          {inlineInAsk ? <p className="stc-how">Choose the missing word.</p> : <Answer item={item} options={options} answer={answer} set={set} checked={checked} />}
          {checked && (
            <div className={'stc-feedback' + (right ? ' right' : '')} role="status">
              <strong>{right ? 'Correct! Nice work.' : 'Not quite.'}</strong>
              {!right && item.hint && <p>💡 {item.hint}</p>}
            </div>
          )}
        </div>
      </div>

      <footer className="stc-foot">
        <button type="button" className="stc-button secondary" disabled={!onPrev || index === 0} onClick={onPrev}>Previous</button>
        <span className="stc-foot-note">{checked ? `${index + 1} of ${total} questions` : 'One try. A hint shows if it’s wrong.'}</span>
        {checked
          ? <button type="button" className="stc-button" disabled={!onNext} onClick={onNext}>{nextLabel}</button>
          : <button type="button" className="stc-button" disabled={previewOnly || !ready} onClick={onCheck}>Check my answer</button>}
      </footer>
    </article>
  )
}

function Answer({ item, options, answer, set, checked }) {
  const want = item.correct || []
  const mark = (id) => (!checked ? '' : want.includes(id) ? ' right' : answer.includes(id) ? ' wrong' : '')

  if (item.kind === 'single' || item.kind === 'multi') {
    const multi = item.kind === 'multi'
    const grid = options.length <= 4 && options.every((o) => o.text.length <= 28)
    return <>
      <p className="stc-how">{multi ? 'Choose all that apply.' : 'Choose one answer.'}</p>
      <div className={'stc-options' + (grid ? ' grid' : '')} role={multi ? 'group' : 'radiogroup'} aria-label={item.prompt}>
        {options.map((o, i) => {
          const on = answer.includes(o.id)
          return <button key={o.id} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={on} className={'stc-option' + (on ? ' selected' : '') + mark(o.id)} disabled={checked}
            onClick={() => set(multi ? (on ? answer.filter((x) => x !== o.id) : [...answer, o.id]) : [o.id])}>
            <span className="stc-marker">{multi ? (on ? '✓' : '') : letter(i)}</span>{o.text}
          </button>
        })}
      </div>
    </>
  }

  if (item.kind === 'inline') {
    const [before, after] = /_{2,}/.test(String(item.text || '')) ? String(item.text).split(/_{2,}/) : [null, null]
    const select = <InlineSelect item={item} options={options} answer={answer} set={set} checked={checked} />
    return before !== null
      ? <p className="stc-inline">{before}{select}{after}</p>
      : <div className="stc-inline"><span className="stc-how">Choose the missing word</span>{select}</div>
  }

  if (item.kind === 'hotspot') {
    return <>
      <p className="stc-how">Tap the words that answer the question.</p>
      <p className="stc-hotspot">{options.map((o) => {
        const on = answer.includes(o.id)
        return <button key={o.id} type="button" aria-pressed={on} className={'stc-seg' + (on ? ' selected' : '') + mark(o.id)} disabled={checked} onClick={() => set(on ? answer.filter((x) => x !== o.id) : [...answer, o.id])}>{o.text}</button>
      })}</p>
    </>
  }

  if (item.kind === 'order') {
    const text = (id) => options.find((o) => o.id === id)?.text
    return <>
      <p className="stc-how">Tap the pieces in order. Tap a chosen piece to take it back.</p>
      <div className={'stc-order-answer' + (checked ? (answer.every((id, i) => id === want[i]) ? ' right' : ' wrong') : '')} aria-label="Your order">
        {answer.length ? answer.map((id, i) => <button key={id} type="button" disabled={checked} onClick={() => set(answer.filter((x) => x !== id))}><b>{i + 1}</b>{text(id)}</button>) : <span>Your order will appear here.</span>}
      </div>
      <div className="stc-order-pool" aria-label="Pieces">
        {options.map((o) => <button key={o.id} type="button" disabled={checked || answer.includes(o.id)} onClick={() => set([...answer, o.id])}>{o.text}</button>)}
      </div>
    </>
  }

  if (item.kind === 'sort') return <SortAnswer item={item} options={options} answer={answer} set={set} checked={checked} />
  if (item.kind === 'match') return <MatchAnswer item={item} answer={answer} set={set} checked={checked} />
  return null
}

function InlineSelect({ item, options, answer, set, checked }) {
  const right = checked && (item.correct || []).includes(answer[0])
  return <select aria-label="Choose the missing word" className={'stc-select' + (checked ? (right ? ' right' : ' wrong') : '')} value={answer[0] || ''} disabled={checked} onChange={(e) => set(e.target.value ? [e.target.value] : [])}>
    <option value="">Choose…</option>
    {options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
  </select>
}

// Sort is drag and drop (Kennady, October 12, 2026: "a sort should truly be drag and drop not tap and tap"). Pointer events, so a
// mouse, a trackpad and a Chromebook touchscreen all drag the same way; a word can go back to the pile or to the other group.
// Keyboard: Enter on a word picks it up, Enter on a group puts it there.
function SortAnswer({ item, options, answer, set, checked }) {
  const [held, setHeld] = useState(null)
  const [drag, setDrag] = useState(null)
  const placed = Object.fromEntries(answer.map((x) => { const [id, g] = x.split(':'); return [id, Number(g)] }))
  const pool = options.filter((o) => placed[o.id] === undefined)
  const text = (id) => options.find((o) => o.id === id)?.text
  const ok = (id, g) => (item.correct || []).includes(`${id}:${g}`)
  const putIn = (id, g) => set(g === 'pool' ? answer.filter((x) => !x.startsWith(id + ':')) : [...answer.filter((x) => !x.startsWith(id + ':')), `${id}:${g}`])
  const dropAt = (x, y) => { const el = document.elementFromPoint(x, y)?.closest('[data-stc-drop]'); if (!el) return null; const v = el.getAttribute('data-stc-drop'); return v === 'pool' ? 'pool' : Number(v) }
  const down = (e, id) => {
    if (checked || e.button > 0) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setHeld(null)
    setDrag({ id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, moved: false, over: null })
  }
  const move = (e) => { if (!drag) return; const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4; setDrag({ ...drag, x: e.clientX, y: e.clientY, moved, over: moved ? dropAt(e.clientX, e.clientY) : null }) }
  const up = (e) => { if (!drag) return; if (drag.moved) { const to = dropAt(e.clientX, e.clientY); if (to !== null) putIn(drag.id, to) } setDrag(null) }
  const word = (o, extra = '') => <button key={o.id} type="button" disabled={checked} aria-pressed={held === o.id}
    className={'stc-word stc-drag' + extra + (held === o.id ? ' held' : '') + (drag?.moved && drag.id === o.id ? ' lifted' : '')}
    onPointerDown={(e) => down(e, o.id)} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHeld(held === o.id ? null : o.id) } }}>{o.text}</button>
  return <>
    <p className="stc-how">Drag each word into its group.</p>
    <div className={'stc-sort-pool' + (drag?.moved && drag.over === 'pool' ? ' over' : '')} data-stc-drop="pool" aria-label="Words to sort">
      {pool.map((o) => word(o))}
      {!pool.length && <span className="stc-done">Every word is sorted.</span>}
    </div>
    <div className="stc-sort-groups">
      {(item.groups || []).map((g, gi) => <div key={gi} data-stc-drop={gi} className={'stc-group' + (held ? ' open' : '') + (drag?.moved && drag.over === gi ? ' over' : '')}>
        {held
          ? <button type="button" className="stc-drop" onClick={() => { putIn(held, gi); setHeld(null) }}>Put “{text(held)}” in {g}</button>
          : <span className="stc-drop">{g}</span>}
        <div className="stc-placed">{options.filter((o) => placed[o.id] === gi).map((o) => word(o, ' placed' + (checked ? (ok(o.id, gi) ? ' right' : ' wrong') : '')))}</div>
      </div>)}
    </div>
    {drag?.moved && <span className="stc-word stc-ghost" aria-hidden="true" style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w }}>{text(drag.id)}</span>}
  </>
}

function MatchAnswer({ item, answer, set, checked }) {
  const [held, setHeld] = useState(null)
  const right = useMemo(() => seededOrder(item.right || [], 'match:' + item.id), [item])
  const pairOf = Object.fromEntries(answer.map((x) => x.split(':')))
  const takenBy = Object.fromEntries(answer.map((x) => { const [l, r] = x.split(':'); return [r, l] }))
  const num = (l) => (item.left || []).findIndex((x) => x.id === l) + 1
  const pick = (r) => { if (!held) return; set([...answer.filter((x) => !x.startsWith(held + ':') && !x.endsWith(':' + r)), `${held}:${r}`]); setHeld(null) }
  const ok = (l) => (item.correct || []).includes(`${l}:${pairOf[l]}`)
  return <>
    <p className="stc-how">Tap a card on the left, then its match on the right.</p>
    <div className="stc-match">
      <div className="stc-match-col">{(item.left || []).map((l, i) => <button key={l.id} type="button" disabled={checked} aria-pressed={held === l.id}
        className={'stc-card' + (held === l.id ? ' held' : '') + (pairOf[l.id] ? ' paired' : '') + (checked ? (ok(l.id) ? ' right' : ' wrong') : '')}
        onClick={() => (pairOf[l.id] && held !== l.id ? set(answer.filter((x) => !x.startsWith(l.id + ':'))) : setHeld(held === l.id ? null : l.id))}>
        <span className="stc-num">{i + 1}</span>{l.text}</button>)}</div>
      <div className="stc-match-col">{right.map((r) => <button key={r.id} type="button" disabled={checked || !held} className={'stc-card' + (takenBy[r.id] ? ' paired' : '')} onClick={() => pick(r.id)}>
        {takenBy[r.id] && <span className="stc-num">{num(takenBy[r.id])}</span>}{r.text}</button>)}</div>
    </div>
  </>
}

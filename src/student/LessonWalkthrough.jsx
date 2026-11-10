/*
 * A Lit Lab lesson the way a student meets it: one page at a time, as an independent walkthrough (Kennady, October 20,
 * 2026, with a ClearLessons Press page beside it: "I want it to be this like independent walk through"). The look is the
 * Press player's: the slide's scene across the top, a white page over it, the "I can" target, teaching text whose
 * vocabulary words open their meaning, a character's line in a bubble, numbered steps shown one at a time, ClearConnect
 * prompts, and checks the student plays (Lit Lab activities) before Next opens.
 *
 * Copied from the CMS (ck12-CMS-V2 src/components/proof-room-play/lesson-walkthrough.jsx); keep the two the same. The student app
 * ships it as src/student/LessonWalkthrough.jsx, handing in its own activity player
 * (`Play`) and where its ClearConnect icons are served from (`assetBase`). Nothing here saves; `onFinish` and `onCheck` report to whoever mounted it.
 */
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
// The CMS imports its activity player here; the student app hands in ProofRoom's ActivityPreview as `Play`.
const ActivityPreview = () => null

export const CONNECT_LABEL = { 'turn-and-talk': 'Turn and Talk', 'think-pair-share': 'Think-Pair-Share', 'work-together': 'Work Together', discussion: 'Discussion', 'dive-deeper': 'Dive Deeper', motion: 'Motion' }
/** Card borders and titles, in the lesson template's own colours (orange, brick, teal), then purple. */
export const CARD_INK = ['#c8661c', '#a8483f', '#2a8a72', '#7a4fc4']
/** A piece's colour when it has not been given one: Lit Lab teal, a gold reminder, a navy ClearConnect. */
export const TONE_OF = { target: 'teal', callout: 'gold', say: 'teal', connect: 'navy', read: 'gold', steps: 'teal' }
export const CONNECT_ICON = (base, k) => `${String(base || '/').replace(/\/?$/, '/')}lit-lab/connect/cc-${k}.png`

/** The walkthrough's styles; the CMS page editor draws its pieces with the same ones. */
export const CSS = `
.llw-canvas-viewport{width:100%;position:relative;overflow:hidden}.llw-canvas{position:relative;width:1200px;transform-origin:top left;background:white;border-radius:22px;overflow:hidden}
.llw-scene+.llw-canvas-viewport{margin-top:-56px;position:relative;z-index:1}
.llw-canvas .llw-flow,.llw-canvas .llw-blk:has(>.llw-says),.llw-canvas .llw-blk:has(>.llw-cards),.llw-canvas .llw-blk:has(>.llw-flipset),.llw-canvas .llw-says,.llw-canvas .llw-cards{display:contents}
.llw-canvas [data-layout-key]{position:absolute!important;margin:0!important;max-width:none!important;min-width:0!important;box-sizing:border-box;overflow:auto}
.llw-canvas img[data-layout-key]{object-fit:contain;overflow:visible}.llw-canvas .llw-blk{flex:none}.llw-canvas .llw-h{display:block!important}
.llw-canvas .llw-fliphint{display:none}.llw-canvas .llw-card-box{height:100%}.llw-canvas .llw-flip-in{min-height:100%;height:100%}
.llw-read-button{border:1px solid #087bb8;border-radius:50%;background:#fff;color:#053b55;width:36px;height:36px;cursor:pointer;display:inline-grid;place-items:center;font-size:20px;box-shadow:0 2px 7px #0002;z-index:4}
.llw-read-button:focus-visible{outline:3px solid #f5b400;outline-offset:2px}.llw-h-row{display:flex;align-items:center;gap:14px}.llw-h-row .llw-h{margin-bottom:0}.llw-can-read,.llw-card-wrap,.llw-cards .llw-card-box,.llw-bubble{position:relative}.llw-can-read{padding-right:46px}.llw-card-wrap{display:grid}.llw-read-corner{position:absolute;top:8px;right:8px;width:32px;height:32px;font-size:16px}.llw-bubble:has(>.llw-read-corner),.llw-card-box:has(>.llw-read-corner){padding-right:48px}.llw-read-button:disabled{opacity:.5;cursor:not-allowed}.llw-next-video{margin:20px 0;display:flex;gap:12px;align-items:center}

.llw{--brand:#0a7dba;--brand-dark:#02384d;--brand-wash:#e6f4fb;--navy:#0d2f55;--gold:#f5b400;--ink:#14344a;--muted:#5c7285;--line:#dde8ee;--display:Georgia,'Source Serif 4','Times New Roman',serif;color:var(--ink);font-family:Manrope,system-ui,sans-serif;font-size:17px;line-height:1.65}
/* Lit Lab's colours for a piece (October 21, 2026: "this is the vibe of lit lab. But I like the pink call out buttons, etc."). */
.llw .tone-teal{--tone:#0a7dba;--tone-wash:#e6f4fb;--tone-ink:#02384d}
.llw .tone-navy{--tone:#0d2f55;--tone-wash:#e9eef5;--tone-ink:#0d2f55}
.llw .tone-gold{--tone:#d99a00;--tone-wash:#fff6dc;--tone-ink:#6e4b00}
.llw .tone-green{--tone:#2e9e6b;--tone-wash:#e7f6ee;--tone-ink:#1d6b47}
.llw .tone-purple{--tone:#7b5cd6;--tone-wash:#f0ebfd;--tone-ink:#4d35a0}
.llw .tone-pink{--tone:#d81bc0;--tone-wash:#fdeefb;--tone-ink:#a8128f}
.llw-flow{display:flex;flex-wrap:wrap;gap:0 22px;align-items:flex-start}
.llw-blk{flex:0 0 100%;min-width:0}
.llw-blk.w-two-thirds{flex-basis:calc(66.66% - 11px)}
.llw-blk.w-half{flex-basis:calc(50% - 11px)}
.llw-blk.w-third{flex-basis:calc(33.33% - 15px)}
@media(max-width:700px){.llw-blk.w-two-thirds,.llw-blk.w-half,.llw-blk.w-third{flex-basis:100%}}
.llw-scene{margin:0;line-height:0;overflow:hidden;height:min(34vh,260px);border-radius:22px 22px 0 0;background:#eef}
.llw-scene img{width:100%;height:100%;display:block;object-fit:cover;object-position:center 45%}
.llw-card{background:#fff;border-radius:22px;padding:clamp(18px,3vw,34px);box-shadow:0 1px 2px rgba(25,23,35,.04),0 8px 24px -8px rgba(25,23,35,.12)}
.llw-over{margin-top:-56px;position:relative;z-index:1}
.llw-h{font-family:var(--display);font-size:clamp(1.55rem,3.4vw,2.2rem);line-height:1.15;margin:0 0 18px;color:var(--navy);font-weight:700;text-wrap:balance}
.llw-kicker{display:block;font-size:.72rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:4px}
.llw p{margin:0 0 16px}
.llw-target{background:var(--tone-wash);border-left:5px solid var(--tone);padding:14px 20px;border-radius:0 12px 12px 0;font-size:1.06rem;margin:0 0 22px;color:var(--ink)}
.llw-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:0 0 20px}
.llw-card-box{border:3px solid var(--c);border-radius:20px;padding:14px 16px;background:#fff;display:grid;align-content:start;gap:8px}
.llw-card-box h3{margin:0;color:var(--c);font-size:1.25rem;font-weight:800;letter-spacing:.02em;text-transform:uppercase;text-align:center}
.llw-card-box p{margin:0;text-align:center}
.llw-card-box .eg{margin-top:4px;padding-top:10px;border-top:2px dashed color-mix(in srgb,var(--c) 35%,transparent)}
.llw-card-box .eg b{display:block;color:var(--c);font-size:.95rem}
.llw-flipset .llw-card-box{cursor:pointer;perspective:1100px;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:center}
.llw-flip-in{display:grid;transition:transform .55s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d;min-height:150px}
.llw-flipped .llw-flip-in{transform:rotateY(180deg)}
.llw-face{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:20px;padding:14px 16px;display:grid;align-content:center;gap:8px}
.llw-front{background:var(--c);color:#fff;box-shadow:0 8px 20px -10px color-mix(in srgb,var(--c) 70%,black)}
.llw-front strong{display:block;font-size:1.35rem;font-weight:800;letter-spacing:.02em;text-transform:uppercase}
.llw-front small{display:block;font-weight:700;opacity:.9}
.llw-back{border:3px solid var(--c);background:#fff;transform:rotateY(180deg);align-content:start}
.llw-back strong{display:block;color:var(--c);font-size:1.15rem;font-weight:800;text-transform:uppercase}
.llw-back-text{display:block}
.llw-back .eg{display:block;padding-top:8px;border-top:2px dashed color-mix(in srgb,var(--c) 35%,transparent)}
.llw-back .eg b{display:block;color:var(--c);font-size:.95rem}
.llw-fliphint{margin:-8px 0 18px;font-size:.88rem;font-weight:700;color:var(--muted)}
@media(prefers-reduced-motion:reduce){.llw-flip-in{transition:none}}
.llw-callout{background:var(--tone-wash);border:1.5px solid color-mix(in srgb,var(--tone) 45%,transparent);border-radius:14px;padding:12px 18px;margin:0 0 20px}
.llw-read{background:#fbfaf6;border:1.5px solid #ece6d6;border-radius:14px;padding:14px 20px;margin:0 0 20px;white-space:pre-line}
.llw-read b{display:block;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:#8a6d1f;margin-bottom:4px}
/* a text that is a real thing in the story, drawn as that thing (October 27, 2026: "could we have an actual image of a sign?") */
.llw-thing{margin:0 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
.llw-thing>figcaption{font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.llw-thing .t{white-space:pre-line;position:relative;max-width:560px;width:100%}
.look-sign .t{background:repeating-linear-gradient(0deg,#b97a3e 0 22px,#ad6f35 22px 24px);color:#fffaf0;font-weight:800;font-size:1.12em;text-align:center;padding:22px 26px;border:6px solid #7a4a1f;border-radius:12px;box-shadow:0 8px 0 -2px #5c3714,0 14px 24px -12px rgba(0,0,0,.45);text-shadow:0 1px 0 rgba(0,0,0,.25)}
.look-sign .posts{display:flex;justify-content:space-between;width:min(380px,70%);height:46px;margin-top:-8px}
.look-sign .posts i{width:16px;height:100%;background:linear-gradient(90deg,#6b3f17,#8a5526);border-radius:0 0 4px 4px}
.look-note .t{background:#fff4a3;color:#3d3400;padding:28px 24px 22px;max-width:420px;transform:rotate(-1.5deg);box-shadow:0 12px 20px -12px rgba(0,0,0,.45);font-size:1.05em}
.look-note .t::before{content:"";position:absolute;top:-10px;left:50%;transform:translateX(-50%) rotate(2deg);width:96px;height:22px;background:rgba(255,255,255,.65);border:1px solid rgba(0,0,0,.06)}
.look-letter .t{background:#fff repeating-linear-gradient(180deg,transparent 0 31px,#d7e6f2 31px 32px);background-position:0 18px;color:#1f2c3a;line-height:32px;padding:18px 26px 22px 54px;border:1px solid #e3e8ee;border-radius:4px;box-shadow:0 10px 22px -14px rgba(0,0,0,.35)}
.look-letter .t::before{content:"";position:absolute;left:40px;top:0;bottom:0;width:2px;background:#f2b8b8}
.look-poster .t{background:#fff;border:8px solid var(--brand);border-radius:6px;text-align:center;font-weight:900;font-size:1.25em;line-height:1.3;padding:26px 22px;color:var(--brand-dark);box-shadow:0 12px 26px -14px rgba(0,0,0,.4)}
.look-label .t{background:#fdf6e3;border:2px solid #c9a24a;border-radius:10px 26px 26px 10px;padding:14px 26px 14px 46px;max-width:420px;font-weight:700;color:#5c4210}
.look-label .t::before{content:"";position:absolute;left:16px;top:50%;width:14px;height:14px;margin-top:-7px;border-radius:50%;background:#fff;border:2px solid #c9a24a}
.look-book .t{background:#fffdf6;font-family:var(--display);font-size:1.08em;line-height:1.6;padding:24px 30px;border-left:10px solid #8a5a2b;border-radius:4px 10px 10px 4px;box-shadow:inset 8px 0 12px -10px rgba(0,0,0,.4),0 10px 22px -14px rgba(0,0,0,.35);color:#2b2016}
.llw-term{font:inherit;color:inherit;font-weight:700;background:none;border:0;padding:0 .05em;cursor:pointer;border-bottom:2px dotted currentColor}
.llw-term:hover,.llw-term:focus-visible{background:var(--brand-wash);border-radius:4px;outline:none}
.llw-term::after{content:"";display:inline-block;width:.42em;height:.42em;margin-left:.28em;border-radius:50%;background:var(--brand);vertical-align:.32em}
/* a character speaks from beside their face (October 26, 2026: "her dialogue bubble comes from her feet, which is weird"):
   the character stands on the right, larger, and the bubble sits level with their head with its tail pointing at them */
/* the speaker is sized by height and sits beside the middle of their bubble (October 26, 2026: "The use of space here for the student is really poor") */
.llw-says{display:flex;flex-direction:row-reverse;justify-content:flex-end;gap:14px;align-items:flex-start;margin:0 0 18px}
.llw-says img{height:clamp(96px,11vw,140px);width:auto;max-width:28%;object-fit:contain;flex:none}
.llw-bubble{position:relative;flex:0 1 auto;min-width:0;max-width:min(100%,44ch);margin-top:10px;background:var(--tone-wash);border:1.5px solid var(--tone);border-radius:14px;padding:10px 16px}
.llw-bubble::before{content:"";position:absolute;right:-9px;top:18px;width:14px;height:14px;background:var(--tone-wash);border-left:1.5px solid var(--tone);border-bottom:1.5px solid var(--tone);transform:rotate(225deg)}
.llw-says.noart{flex-direction:row}
.llw-says.noart .llw-bubble{margin-top:0}
.llw-says.noart .llw-bubble::before{display:none}
/* a character whose picture looks right stands on the left, looking at the bubble */
.llw-says.left{flex-direction:row}
.llw-says.left .llw-bubble::before{right:auto;left:-9px;transform:rotate(45deg)}
.llw-bubble b{display:block;color:var(--tone-ink);font-size:.85rem}
.llw-steps{list-style:none;padding:0;margin:0 0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.llw-steps li{position:relative;padding:14px 14px 14px 56px;background:var(--brand-wash);border-radius:16px;font-weight:700;line-height:1.3}
.llw-steps li::before{content:attr(data-n);position:absolute;left:12px;top:12px;width:34px;height:34px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:800}
.llw-why{color:var(--muted);font-size:.9rem;font-weight:600;margin-top:4px}
.llw-more{font:inherit;font-size:.82em;font-weight:800;border:0;color:var(--brand);background:var(--brand-wash);border-radius:999px;padding:6px 14px;cursor:pointer;margin:-8px 0 20px 52px}
.llw-more:hover{background:var(--brand);color:#fff}
.llw-connect{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;border:1.5px solid color-mix(in srgb,var(--tone) 40%,transparent);border-radius:16px;padding:12px 16px;margin:0 0 20px;background:var(--tone-wash)}
.llw-connect img{width:58px;height:58px;object-fit:contain}
.llw-connect b{display:block;font-size:.78rem;letter-spacing:.07em;text-transform:uppercase;color:var(--tone-ink)}
.llw-connect p{margin:0}
.llw-figure{margin:0 0 20px;text-align:center}
.llw-figure img{max-width:100%;max-height:320px;border-radius:12px}
.llw-figure figcaption{color:var(--muted);font-size:.92rem;margin-top:6px}
.llw-check{border:2px solid var(--line);border-radius:18px;padding:14px;margin:0 0 20px;background:#fcfcfe}
.llw-check.done{border-color:#86d3a5;background:#f4fbf6}
.llw-check-head{display:flex;justify-content:space-between;align-items:center;font-size:.78rem;letter-spacing:.07em;text-transform:uppercase;font-weight:800;color:var(--brand-dark);margin:0 4px 8px}
.llw-check-head span{color:#1d7a46}
.llw-empty{color:var(--muted);font-style:italic}
.llw-word-def{margin:12px 0 0;padding:12px 14px;background:var(--brand-wash);border-radius:14px;animation:llw-pop .25s ease-out}
.llw-word-def h4{margin:0 0 4px;font-size:1.1rem;color:var(--brand-dark)}
.llw-word-def p{margin:0;font-size:1rem;line-height:1.45}
.llw-word-def .eg{margin:8px 0 0;padding:8px 12px;background:#fff;border-radius:10px;font-size:.95rem}
.llw-word-def .eg b{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
.llw-words button[aria-expanded="true"]{background:var(--brand);color:#fff}
.llw-words .llw-word-def{animation:none}
.llw-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px}
.llw-nav .llw-btn{flex:none}
.llw-btn{font:inherit;font-weight:800;padding:10px 22px;border-radius:999px;border:1.5px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
.llw-btn.llw-go{background:var(--navy);border-color:var(--navy);color:#fff}
.llw-btn:disabled{opacity:.4;cursor:not-allowed}
.llw-progress{height:6px;background:var(--line);border-radius:999px;overflow:hidden;margin:0 0 14px}
.llw-progress i{display:block;height:100%;background:var(--brand);transition:width .3s}
.llw-wait{font-size:.88rem;color:var(--muted)}
/* The student's full-width view (October 21, 2026: "We have a lot of space on the student side to make this a cool and
   engaging experience for students"): the scene as a banner with the title on it, the page beside its guide and its words. */
.llw-wide .llw-hero{position:relative;border-radius:26px;overflow:hidden;height:clamp(200px,34vh,340px);background:linear-gradient(135deg,#01172d,#035c78 60%,#06aade);margin:0 0 -64px}
.llw-wide .llw-hero img{width:100%;height:100%;object-fit:cover;object-position:center 45%;display:block}
.llw-wide .llw-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,10,30,0) 35%,rgba(15,10,30,.55))}
.llw-wide .llw-hero-copy{position:absolute;left:clamp(18px,3vw,36px);right:clamp(18px,3vw,36px);bottom:84px;z-index:1;color:#fff}
.llw-wide .llw-hero-copy span{display:inline-block;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.22);backdrop-filter:blur(6px);border-radius:999px;padding:4px 12px;margin-bottom:8px}
.llw-wide .llw-hero-copy h2{margin:0;font-family:var(--display);font-size:clamp(1.7rem,3.6vw,2.6rem);line-height:1.1;font-weight:700;text-shadow:0 2px 14px rgba(0,0,0,.35);text-wrap:balance}
.llw-wide .llw-cols{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:22px;align-items:start;padding:0 clamp(10px,2vw,24px)}
.llw-wide .llw-cols.solo{grid-template-columns:minmax(0,1fr);max-width:1000px;margin:0 auto}
.llw-wide .llw-cols.video{max-width:none}
.llw-blk.llw-after{animation:llw-reveal .55s cubic-bezier(.2,.8,.3,1)}
@keyframes llw-reveal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.llw-wide .llw-card{padding:clamp(22px,3vw,40px);font-size:18.5px}
/* lesson video */
.llv{margin:0 0 20px}
.llv-frame{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;container-type:inline-size;box-shadow:0 14px 34px -18px rgba(2,56,77,.5)}
.llv-frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
/* the speaker stands in the middle of the clip: the title and chips take the left third, the cards stack down the right third
   (October 26, 2026: a video window over the scene "looks weird"; the teaching beside a centred character is what she kept) */
.llv-board{position:absolute;top:4cqw;bottom:12cqw;left:3cqw;right:3cqw;display:grid;grid-template-columns:30cqw 1fr 30cqw;gap:2cqw;pointer-events:none}
.llv-side{display:grid;align-content:start;justify-items:center;gap:1.4cqw}
.llv-side.r{grid-column:3;justify-items:stretch;gap:1.2cqw}
.llv-title{display:grid;justify-items:center;gap:.8cqw;animation:llv-in .45s cubic-bezier(.2,.8,.3,1.4)}
.llv-title b{font-family:'Baloo 2',Manrope,sans-serif;font-weight:800;font-size:4.4cqw;line-height:1;color:#fff;text-shadow:0 .5cqw 1.6cqw rgba(0,0,0,.5);text-transform:uppercase;text-align:center}
.llv-title span{font-weight:800;font-size:1.9cqw;color:#fff;background:rgba(13,47,85,.85);padding:.6cqw 1.8cqw;border-radius:99cqw;text-align:center}
.llv-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:1cqw;animation:llv-in .4s}
.llv-chips span{font-weight:800;font-size:1.9cqw;padding:.6cqw 1.6cqw;border-radius:99cqw;background:rgba(255,255,255,.9);color:#14344a;transition:.35s}
.llv-chips span.lit{background:#2a8a72;color:#fff;box-shadow:0 0 0 .45cqw #f5b400;transform:scale(1.08)}
.llv-cards{display:grid;gap:1.2cqw;width:100%}
.llv-card{background:rgba(255,255,255,.96);border-radius:1.8cqw;padding:1cqw 1cqw 1.2cqw;display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:1cqw;box-shadow:0 1cqw 2.4cqw -1cqw rgba(0,0,0,.5);opacity:0;transform:translateY(3cqw) rotate(-3deg);transition:.45s cubic-bezier(.2,.8,.3,1.3)}
.llv-card.in{opacity:1;transform:none}
.llv-card b{font-family:'Baloo 2',Manrope,sans-serif;font-weight:800;font-size:2.4cqw;line-height:1.05;color:var(--c);text-transform:uppercase;text-align:left}
.llv-card i{font-style:normal;font-size:3.6cqw;line-height:1.1;grid-row:span 2}
.llv-card small{font-size:1.4cqw;font-weight:700;color:#14344a;text-align:left}
.llv-cc{position:absolute;left:50%;bottom:1.6cqw;transform:translateX(-50%);max-width:60cqw;background:rgba(0,0,0,.72);color:#fff;border-radius:1.2cqw;padding:.8cqw 1.8cqw;font-size:1.9cqw;font-weight:700;text-align:center;line-height:1.3}
.llv-cc span{display:block;font-size:1.2cqw;letter-spacing:.08em;text-transform:uppercase;color:#f5b400}
.llv-play{position:absolute;inset:0;display:grid;place-items:center;border:0;background:rgba(5,25,15,.25);cursor:pointer;font:inherit;color:#fff}
.llv-play span{display:grid;place-items:center;width:11cqw;height:11cqw;border-radius:50%;background:rgba(13,47,85,.92);font-size:4.4cqw;box-shadow:0 1cqw 3cqw rgba(0,0,0,.4)}
.llv-play em{display:block;margin-top:1.2cqw;font-style:normal;font-weight:800;font-size:2.2cqw;text-shadow:0 .3cqw 1cqw rgba(0,0,0,.5)}
.llv-play:focus-visible span{outline:.5cqw solid #f5b400}
.llv-done{margin:8px 2px 0;font-weight:800;color:#2e8b57}
.llv-script{border:2px dashed var(--line);border-radius:14px;padding:12px 16px;margin:0 0 18px;background:#fafcfd}
.llv-script-head{font-size:.78rem;letter-spacing:.07em;text-transform:uppercase;font-weight:800;color:var(--muted);margin-bottom:6px}
.llv-script p{margin:4px 0}
@keyframes llv-in{from{opacity:0;transform:scale(.7)}}
@media (prefers-reduced-motion:reduce){.llv *{animation:none!important;transition:none!important}}
.llw-young{font-size:22px;line-height:1.55}
.llw-young.llw-wide .llw-card{font-size:25px}
.llw-young .llw-h{font-size:clamp(1.9rem,4vw,2.6rem)}
.llw-young .llw-target{font-size:1.1em}
.llw-young .llw-card-box h3,.llw-young .llw-front strong{font-size:1.5rem}
.llw-young .llw-back strong{font-size:1.3rem}
.llw-young .llw-read,.llw-young .llw-bubble{font-size:1.04em}
.llw-young .llw-why,.llw-young .llw-figure figcaption,.llw-young .llw-fliphint{font-size:1rem}
.llw-young .llw-check{font-size:1.15em}
.llw-young .llw-check>:not(.llw-check-head){zoom:1.22}
.llw-young .llw-btn,.llw-young.llw-wide .llw-btn{font-size:1.2rem;padding:14px 32px}
.llw-wide .llw-card .llw-h{display:none}
.llw-aside{position:sticky;top:16px;display:grid;gap:14px}
.llw-words{background:#fff;border-radius:22px;padding:14px 16px;box-shadow:0 8px 24px -10px rgba(25,23,35,.18)}
.llw-words h3,.llw-todo h3{margin:0 0 8px;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.llw-words div{display:flex;flex-wrap:wrap;gap:8px}
.llw-words button{font:inherit;font-weight:700;font-size:.95rem;border:1.5px solid var(--brand);color:var(--brand-dark);background:var(--brand-wash);border-radius:999px;padding:5px 12px;cursor:pointer}
.llw-todo{background:#fff;border-radius:22px;padding:14px 16px;box-shadow:0 8px 24px -10px rgba(25,23,35,.18)}
.llw-todo p{margin:0;font-weight:700}
.llw-todo p.ok{color:#1d7a46}
.llw-cheer{display:flex;align-items:center;gap:10px;margin:0 4px 10px;padding:10px 14px;border-radius:14px;background:#fff6dc;color:#6e4b00;font-weight:800;animation:llw-pop .45s cubic-bezier(.2,1.4,.4,1)}
.llw-trail{display:flex;flex-wrap:wrap;gap:14px 22px;align-items:flex-end;margin:0 0 16px}
.llw-trail section{display:grid;gap:6px}
.llw-trail small{font-size:.72rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.llw-trail section.on small{color:var(--brand-dark)}
.llw-trail section > div{display:flex;gap:6px}
.llw-trail i{width:12px;height:12px;border-radius:50%;background:var(--line);transition:transform .2s}
.llw-trail i.seen{background:#c58ad8}
.llw-trail i.on{background:var(--brand);transform:scale(1.45);box-shadow:0 0 0 4px var(--brand-wash)}
.llw-wide .llw-nav{position:sticky;bottom:0;z-index:5;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-radius:18px;padding:12px 16px;margin:18px clamp(10px,2vw,24px) 0;box-shadow:0 -6px 24px -12px rgba(25,23,35,.25)}
.llw-wide .llw-btn{font-size:1.05rem;padding:12px 28px}
.llw-cover{position:relative;overflow:hidden;border-radius:26px;min-height:clamp(380px,62vh,580px);display:flex;flex-direction:column;justify-content:space-between;color:#fff;background:linear-gradient(135deg,#01172d,#035c78 60%,#06aade);isolation:isolate}
.llw-cover-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.llw-cover::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(20,10,40,.62) 0%,rgba(20,10,40,.18) 42%,rgba(20,10,40,0) 60%,rgba(20,10,40,.38) 100%)}
.llw-cover-copy{padding:clamp(22px,4vw,48px) clamp(22px,4vw,48px) 0;max-width:760px}
.llw-slide{position:relative;overflow:hidden;background:#fff;border-radius:26px;min-height:min(72vh,680px);display:flex;flex-direction:column;justify-content:center;box-shadow:0 1px 2px rgba(25,23,35,.04),0 8px 24px -8px rgba(25,23,35,.12)}
.llw-slide.has-scene{background:linear-gradient(135deg,#01172d,#035c78 60%,#06aade);padding:clamp(22px,5vh,64px) clamp(18px,5vw,84px)}
.llw-slide-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 45%;display:block}
.llw-slide-panel{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(16px,2.4vh,28px);padding:clamp(26px,4vw,56px) clamp(24px,4.5vw,72px)}
.llw-slide.has-scene .llw-slide-panel{background:rgba(255,255,255,.95);backdrop-filter:blur(6px);border-radius:24px;padding:clamp(22px,3.4vw,48px) clamp(22px,3.8vw,60px);box-shadow:0 18px 50px -18px rgba(10,20,40,.55);max-width:1040px;width:100%;margin:0 auto}
.llw-slide-head{display:grid;gap:10px}
.llw-slide-head>span{font-size:.92rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--brand-dark,#0f6f8f)}
.llw-slide-head h2{margin:0;font-family:var(--display);font-size:clamp(2rem,4.4vw,3.4rem);line-height:1.06;letter-spacing:-.015em;color:var(--navy);font-weight:700;text-wrap:balance}
.llw-slide-body{font-size:clamp(1.1rem,1.6vw,1.4rem);line-height:1.5;display:grid;gap:18px}
.llw-slide-body .llw-blk.k-text p{margin:0;font-size:1.15em;color:var(--ink)}
.llw-slide-body .llw-target{margin:0}
.llw-young .llw-slide-head h2{font-size:clamp(2.2rem,5vw,3.8rem)}
/* in the student site's frame the slide reaches down to the bottom bar */
.llx-page .llw-slide{min-height:calc(100vh - 190px)}
/*
 * The cover fits the window too (November 10, 2026, at Chromebook size, 1366 x 768: "it just doesn't quite fit how I want it to"):
 * exactly the stage's height, the title sized by the window's height as well as its width, the words on a soft panel so the
 * scene's own signs do not fight them, and the character standing in the corner at a height the window has room for.
 */
.llx-page .llw-cover{height:calc(100vh - 190px);min-height:340px;justify-content:flex-start}
.llx-page .llw-cover-copy{margin:clamp(12px,2.4vh,26px);padding:clamp(14px,2.4vh,24px) clamp(16px,2vw,28px);max-width:min(640px,62%);background:rgba(1,23,45,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:22px}
.llx-page .llw-cover-copy h1{font-size:clamp(2rem,min(5.2vw,8vh),4.2rem);margin:8px 0 12px}
.llx-page .llw-cover-copy p{font-size:clamp(1rem,min(1.8vw,2.8vh),1.35rem)}
.llx-page .llw-cover-copy .llw-cover-goal{font-size:clamp(.98rem,min(1.6vw,2.6vh),1.25rem);padding:10px 16px;margin-bottom:10px}
.llx-page .llw-cover>div:last-child{position:absolute;right:0;bottom:0}
.llx-page .llw-cover-cast{margin:0;padding:0 clamp(16px,4vw,56px) 0 0}
.llx-page .llw-cover-cast img{height:clamp(140px,40vh,320px);max-width:34vw}
.llx-page .llw-cover-say{max-width:min(280px,30vw);font-size:clamp(.92rem,1.4vw,1.05rem)}
.llw-slide-panel.split{display:grid;grid-template-columns:minmax(240px,30%) minmax(0,1fr);gap:clamp(18px,2.4vw,36px);align-items:center}
.llw-slide.has-scene .llw-slide-panel.split{max-width:1500px}
.llw-slide.has-scene:has(.llw-slide-panel.split){padding:clamp(12px,2.4vh,28px) clamp(12px,1.8vw,28px)}
.llw-slide-side{display:grid;gap:16px;align-content:start;max-height:calc(100vh - 230px);overflow:auto;padding-right:4px}
.llw-slide-side .llw-slide-head h2,.llw-young .llw-slide-side .llw-slide-head h2{font-size:clamp(1.5rem,2.5vw,2.3rem)}
.llw-slide-side .llw-slide-body{font-size:clamp(1rem,1.25vw,1.15rem);gap:12px}
.llw-slide-main{min-width:0;max-height:calc(100vh - 230px);overflow:auto}
.llw-slide-main .llv{margin:0 auto;width:min(100%,calc((100vh - 290px) * 16 / 9))}
@media(max-width:900px){.llw-slide-panel.split{grid-template-columns:1fr}.llw-slide-side,.llw-slide-main{max-height:none}}
.llw-cover-copy>span{display:inline-block;font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:rgba(255,255,255,.22);backdrop-filter:blur(6px);border-radius:999px;padding:5px 14px}
.llw-cover-copy h1{margin:12px 0 10px;font-family:var(--display);font-size:clamp(2.4rem,6vw,4.4rem);line-height:1.02;font-weight:700;letter-spacing:-.01em;text-shadow:0 4px 24px rgba(0,0,0,.35);text-wrap:balance}
.llw-cover-copy p{margin:0;font-size:clamp(1.1rem,2.2vw,1.45rem);font-weight:700;text-shadow:0 2px 12px rgba(0,0,0,.45);max-width:34ch}
.llw-cover-copy .llw-term{color:#fff;border-bottom-color:#fff}
.llw-cover-copy .llw-cover-goal{margin:0 0 14px;display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.94);color:var(--ink);border-radius:16px;padding:12px 18px;font-size:clamp(1.05rem,2vw,1.3rem);font-weight:700;line-height:1.35;text-shadow:none;max-width:40ch;box-shadow:0 10px 30px -12px rgba(0,0,0,.45)}
.llw-cover-copy .llw-cover-goal b{flex:none;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--brand-dark);padding-top:.35em}
.llw-cover-copy .llw-cover-goal .llw-term{color:var(--ink);border-bottom-color:currentColor}
.llw-cover-say{margin:18px auto 0;background:#fff;color:var(--ink);border-radius:18px;padding:10px 18px;font-size:1.05rem;line-height:1.4;box-shadow:0 10px 30px -10px rgba(0,0,0,.4);position:relative;width:max-content;max-width:min(320px,80vw);text-align:left}
.llw-cover-say b{display:block;color:var(--brand-dark);font-size:.85rem}
.llw-cover-say::after{content:"";position:absolute;bottom:-8px;left:calc(50% - 8px);width:16px;height:16px;background:#fff;transform:rotate(45deg)}
.llw-cover-cast figure{position:relative}
.llw-cover-cast figure .llw-cover-say{position:absolute;bottom:calc(100% + 6px);right:0;margin:0;z-index:1}
.llw-cover-cast figure .llw-cover-say::after{left:auto;right:36px}
.llw-cover-cast{display:flex;justify-content:flex-end;align-items:flex-end;padding:0 clamp(24px,6vw,80px) 0 16px;margin-top:clamp(110px,16vh,150px)}
.llw-cover-cast figure{margin:0;display:grid;justify-items:center;animation:llw-rise .6s cubic-bezier(.2,1.2,.4,1) both}
.llw-cover-cast img{height:clamp(170px,32vh,300px);width:auto;max-width:40vw;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(0,0,0,.35))}
@keyframes llw-rise{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@keyframes llw-pop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
@media(max-width:900px){.llw-wide .llw-cols{grid-template-columns:1fr}.llw-aside{position:static;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}}
@media(prefers-reduced-motion:reduce){.llw-progress i,.llw-trail i{transition:none}.llw-cheer,.llw-cover-cast figure{animation:none}}
`

/** Text with [[vocabulary]] words and {{underlined}} words. */
function Rich({ text, onTerm }) {
  return String(text || '').split(/(\[\[[^[\]]+\]\]|\{\{[^{}]+\}\}|\*\*[^*]+\*\*)/).filter(Boolean).map((bit, i) => {
    const term = /^\[\[([^[\]]+)\]\]$/.exec(bit)
    if (term) return <button key={i} type="button" className="llw-term" onClick={() => onTerm(term[1])}>{term[1]}</button>
    const bold = /^\*\*([^*]+)\*\*$/.exec(bit)
    if (bold) return <strong key={i}>{bold[1]}</strong>
    const under = /^\{\{([^{}]+)\}\}$/.exec(bit)
    return under ? <u key={i}>{under[1]}</u> : <React.Fragment key={i}>{bit}</React.Fragment>
  })
}

const paragraphs = (text) => String(text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

/** The [[vocabulary]] words a page's teaching marks, each once. */
const wordsOn = (page) => [...new Set((page.walk || []).flatMap((b) => [b.text, b.who && b.text, ...(b.steps || []).flatMap((s) => [s.text, s.why]), ...(b.cards || []).flatMap((c) => [c.text, c.example])]).filter(Boolean).flatMap((t) => [...String(t).matchAll(/\[\[([^[\]]+)\]\]/g)].map((m) => m[1])))]

/** Where a page sits in the lesson, for the student's trail: getting ready, a part, or the exit tickets. */
export const sectionOf = (page) => (page.type === 'exit_ticket' ? 'Show what you know' : page.block ? `Part ${page.block}` : 'Get ready')

/*
 * A page as slides (November 9, 2026: "think more slide by slide based rather than a scrolling lesson"): each slide is one thing
 * to look at or do (cards, a passage, worked steps, a video, a picture, a talk prompt or an activity), with the short lines that
 * lead into it (the target, a teaching line, a character's line). An activity stays on the slide of the passage or picture it is
 * about. The cover and a page the publisher arranged by hand are one slide each.
 */
const SLIDE_MAIN = new Set(['cards', 'read', 'steps', 'video', 'picture', 'check', 'connect'])
export function slidesOf(page) {
  const blocks = page.walk || []
  if (page.type === 'breakout_title' || page.arrangement || !blocks.length) return [blocks.map((_, i) => i)]
  const out = []
  let lead = []
  blocks.forEach((b, i) => {
    if (!SLIDE_MAIN.has(b.kind)) { lead.push(i); return }
    const prev = out[out.length - 1]
    if (b.kind === 'check' && !lead.length && prev && prev.some((k) => blocks[k].kind === 'read' || blocks[k].kind === 'picture') && !prev.some((k) => blocks[k].kind === 'check')) { prev.push(i); return }
    out.push([...lead, i])
    lead = []
  })
  if (lead.length) { if (out.length) out[out.length - 1].push(...lead); else out.push(lead) }
  return out
}
/** The lesson as one list of slides: each with its page, the page's place in the lesson, and the pieces it shows. */
export function lessonSlides(pages) {
  return pages.flatMap((page, pageAt) => { const all = slidesOf(page); return all.map((only, n) => ({ page, pageAt, only, n, of: all.length })) })
}
/** The pieces on screen at a slide: every slide of its page up to and including it, so the page builds down as the student goes. */
export const shownOn = (slides, at) => { const cur = slides[at]; return cur ? slides.filter((sl) => sl.pageAt === cur.pageAt && sl.n <= cur.n).flatMap((sl) => sl.only) : [] }
/** What a slide waits for before Continue: its activity, its cards to turn over, its video to the end. */
export function slideGate(slide, mine = {}) {
  const blocks = slide.page.walk || []
  const flips = (b) => b.kind === 'cards' && (b.flip || slide.page.flow === 'cards-video' || (slide.page.type === 'example' && slide.page.flow === 'cards-attempt'))
  const waits = slide.only.filter((i) => blocks[i] && (gates(blocks[i]) || flips(blocks[i])) && !mine[i])
  const open = !waits.length
  const wait = open ? '' : waits.some((i) => blocks[i].kind === 'cards') ? 'Turn over every card to go on' : waits.some((i) => blocks[i].kind === 'video') ? 'Watch the video to go on' : 'Finish the activity to go on'
  return { open, wait }
}

/** A video's clips, however it was saved: `clips`, or the one-clip shape (src, times, job) videos were first saved in. */
const clipsOf = (p) => (p.clips?.length ? p.clips : p.src || p.job ? [{ from: 0, src: p.src, times: p.times, job: p.job }] : [])
const videoReady = (p) => { const c = clipsOf(p); return c.length > 0 && c.every((k) => !!k.src) }

/** Pieces the student has to finish before Next: a check, cards to turn over, a video to watch to the end. */
// An activity whose directions and first line are the same sentence says it once.
const said = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const onceSaid = (act) => (act && act.brief && said(act.brief) === said(act.directions) ? { ...act, brief: '' } : act)
const gates = (b) => b.kind === 'check' || (b.kind === 'cards' && b.flip) || (b.kind === 'video' && videoReady(b))

/**
 * A lesson video (October 22, 2026: "they are watching little videos along the way"): the animated clips, played back to
 * back as one video, with the script's words put on top as each line starts, in the open middle of the frame, never over a
 * character ("I don't like that the cards cover the character"). Cards appear one after another across their line. `onDone`
 * fires when the last clip has played to the end. Before a video is made, its script is shown to read.
 */
export function LessonVideo({ piece, onDone = null, done = false, autoPlay = false }) {
  const ref = useRef(null)
  const [t, setT] = useState(0)
  const [at, setAt] = useState(0)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(done)
  const [dur, setDur] = useState(0)
  const lines = piece.script?.lines || []
  const clips = clipsOf(piece)
  const ready = videoReady(piece)
  const last = at >= clips.length - 1
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    let raf = 0
    const tick = () => { setT(v.currentTime); if (!v.paused && !v.ended) raf = requestAnimationFrame(tick) }
    const play = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick) }
    // The next clip follows on at once; the last one ends the video.
    const end = () => { if (last) { setT(v.duration || 0); setEnded(true); if (onDone) onDone() } else { setAt((k) => k + 1); setT(0) } }
    const meta = () => { setDur(v.duration || 0); if (at > 0) v.play().catch(() => {}) }
    v.addEventListener('play', play); v.addEventListener('seeked', tick); v.addEventListener('ended', end); v.addEventListener('loadedmetadata', meta)
    return () => { cancelAnimationFrame(raf); v.removeEventListener('play', play); v.removeEventListener('seeked', tick); v.removeEventListener('ended', end); v.removeEventListener('loadedmetadata', meta) }
  }, [onDone, at, last])
  if (!ready) return (
    <section className="llv-script" aria-label="Video script">
      <div className="llv-script-head">🎬 Video{clips.some((k) => k.job) ? ' · being made' : ''}</div>
      {lines.map((l, i) => <p key={i}><b>{l.who}:</b> {l.text}</p>)}
    </section>
  )
  const clip = clips[at], from = clip.from, to = clips[at + 1]?.from ?? lines.length
  // A video uploaded whole already has its teaching and captions in the picture: nothing is drawn on top.
  const baked = !!piece.baked
  const own = lines.slice(from, to)
  const times = clip.times?.length === own.length ? clip.times : own.map((_, i) => (i * (dur || own.length * 3)) / Math.max(1, own.length))
  // When each line starts on this clip's clock: lines of earlier clips were said already, later ones are still to come.
  const startOf = (i) => (i < from ? -1 : i >= to ? Infinity : times[i - from])
  // What the screen shows by now: the latest title, the latest choices, and the cards said so far.
  let title = null, chips = null, cards = null, now = -1
  lines.forEach((l, i) => {
    const s0 = startOf(i)
    if (t < s0) return
    now = i
    const s = l.show
    if (!s) return
    if (s.kind === 'title') title = s
    if (s.kind === 'chips') chips = s
    if (s.kind === 'cards') {
      if (s0 < 0) { cards = { cards: s.cards, shown: s.cards.length }; return }
      const next = i + 1 < to ? times[i + 1 - from] : dur || s0 + 3
      const span = Math.max(0.6, next - s0 - 0.3)
      cards = { cards: s.cards, shown: s.cards.filter((_, k) => t >= s0 + (k * span) / s.cards.length).length }
    }
  })
  const say = now >= 0 ? lines[now] : null
  return (
    <section className={'llv' + (ended ? ' ended' : '')} aria-label="Lesson video">
      <div className="llv-frame">
        <video key={clip.src} ref={ref} src={clip.src} playsInline autoPlay={autoPlay} preload="metadata" controls={started} onPlay={() => setStarted(true)} />
        {!baked && <div className="llv-board" aria-hidden={!started}>
          <div className="llv-side l">
            {title && <div className="llv-title"><b>{title.text}</b>{title.note && <span>{title.note}</span>}</div>}
            {chips && <div className="llv-chips">{chips.items.map((c, k) => <span key={k} className={k === chips.lit ? 'lit' : ''}>{c}</span>)}</div>}
          </div>
          <div className="llv-side r">
            {cards && <div className="llv-cards">{cards.cards.map((c, k) => <div key={k} className={'llv-card' + (k < cards.shown ? ' in' : '')} style={{ '--c': CARD_INK[k % CARD_INK.length] }}>{c.pic && <i>{c.pic}</i>}<b>{c.title}</b>{c.text && <small>{c.text}</small>}</div>)}</div>}
          </div>
        </div>}
        {!baked && started && say && !(last && t >= (dur || Infinity) - 0.05) && <div className="llv-cc" aria-live="polite"><span>{say.who}</span>{say.text}</div>}
        {!started && <button type="button" className="llv-play" onClick={() => ref.current?.play()} aria-label="Play the video"><span>▶</span><em>Watch</em></button>}
      </div>
      {ended && <p className="llv-done">✓ Watched</p>}
    </section>
  )
}

/**
 * Cards the student turns over (October 21, 2026: "these cards were facing the other way, and they have to click them to
 * 'turn them over' to learn more. They have to open all of them to be able to move on"). `onAll` fires once every card
 * has been turned.
 */
function FlipCards({ cards, onTerm, onAll, done, itemProps = () => ({}), speak = false }) {
  const [up, setUp] = useState(() => new Set(done ? cards.map((_, k) => k) : []))
  const turn = (k) => setUp((now) => {
    const next = new Set(now)
    next.add(k)
    if (next.size === cards.length && now.size < cards.length && onAll) setTimeout(onAll, 400)
    return next
  })
  return (
    <>
      <div className="llw-cards llw-flipset">
        {cards.map((c, k) => { const card = (
          <button key={k} type="button" className={'llw-card-box' + (up.has(k) ? ' llw-flipped' : '')} {...itemProps(k)} style={{ '--c': CARD_INK[k % CARD_INK.length], ...itemProps(k).style }}
            aria-pressed={up.has(k)} aria-label={up.has(k) ? c.title : `${c.title}: turn the card over`} onClick={() => turn(k)}>
            <span className="llw-flip-in">
              <span className="llw-face llw-front"><strong>{c.title}</strong><small>Tap to turn over ↻</small></span>
              <span className="llw-face llw-back" aria-hidden={!up.has(k)}>
                <strong>{c.title}</strong>
                <span className="llw-back-text"><Rich text={c.text} onTerm={onTerm} /></span>
                {c.example && <span className="eg"><b>Example:</b><Rich text={c.example} onTerm={onTerm} /></span>}
              </span>
            </span>
          </button>
          )
          // A card's listen button sits over its corner once it is turned (a button cannot sit inside the card's own button).
          return speak ? <div key={k} className="llw-card-wrap">{card}{up.has(k) && <ReadAloud text={[c.title, c.text, c.example && `For example: ${c.example}`].filter(Boolean).join('. ')} label={`Read aloud: ${c.title}`} className="llw-read-button llw-read-corner" />}</div> : card
        })}
      </div>
      {up.size < cards.length && <p className="llw-fliphint">Turn over every card: {up.size} of {cards.length}</p>}
    </>
  )
}

/** Read only the selected item's words, using the device's voice. No audio is sent to a service. */
export function ReadAloud({ text, label = 'Read aloud', style, className = 'llw-read-button' }) {
  const [speaking, setSpeaking] = useState(false)
  const supported = useSyncExternalStore(() => () => {}, () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, () => false)
  const utterance = useRef(null)
  useEffect(() => {
    return () => { if (utterance.current) window.speechSynthesis?.cancel() }
  }, [])
  function play() {
    if (!supported) return
    window.speechSynthesis.cancel()
    if (speaking) { setSpeaking(false); utterance.current = null; return }
    const u = new SpeechSynthesisUtterance(String(text).replace(/\[\[|\]\]|\{\{|\}\}|\*\*|==/g, ''))
    u.lang = 'en-US'; u.rate = .85
    u.onend = u.onerror = () => { setSpeaking(false); utterance.current = null }
    utterance.current = u; setSpeaking(true); window.speechSynthesis.speak(u)
  }
  return <button type="button" className={className} style={style} disabled={!supported} aria-label={speaking ? 'Stop reading' : label} title={supported ? label : 'Read aloud is unavailable in this browser'} onClick={play}>{speaking ? '■' : '🔊'}</button>
}

/** The page's title the way the deck says it: "Instruction 1: Author's Purpose". */
/**
 * Grade 2 and below read big (Kennady, October 22, 2026: "2nd grade has to be super basic, big fonts, etc. It can get more
 * complex as we go up in grade levels").
 */
export function youngReader(lesson) {
  const g = String(lesson?.grade ?? '').trim()
  if (!g) return false
  const n = Number(g.replace(/\D/g, ''))
  return /^k/i.test(g) || (Number.isFinite(n) && n <= 2)
}

/**
 * A page's title as the student sees it: the kind of page and what it teaches, with no block number and no "Another"
 * (October 26, 2026: "it could just be Example: Author's Purpose. It doesn't need the 1 or 'Another'"). The rail in the CMS
 * keeps the numbered labels so a publisher can tell the pages apart.
 */
/** A slide's big heading: the skill the page is about ("Say why it proves your answer"); the line above it names the page. */
export const slideTitle = (page) => (typeof page.title === 'string' && page.title.trim()) || String(page.heading || '').split(' — ').slice(1).join(' — ').trim() || pageTitle(page)
/**
 * A page's name as people see it, without its number: the second Example is "Example" too (November 10, 2026: "I don't like
 * 'Another Example' It should just be 'Example', 'Example'"). The stored label still marks it as the guided one.
 */
export const shownLabel = (page) => String(page.label || '').replace(/^Another\s+/i, '').replace(/\s+\d+$/, '')
export function pageTitle(page) {
  // The title the publisher wrote, when there is one (November 2, 2026: "I need all parts to be editable - even the title").
  if (typeof page.title === 'string' && page.title.trim()) return page.title.trim()
  const rest = String(page.heading || '').split(' — ').slice(1).join(' — ')
  const name = String(page.label || '').replace(/^Another\s+/i, '')
  if (page.type === 'breakout_title') return page.heading
  return rest ? `${name}: ${rest}` : name
}

/**
 * One lesson page. `student`: steps appear one at a time and each check reports when it is done (`onCheck(blockIndex)`).
 * `picture(value)` turns a stored picture (an https address, an art id, a picture still inside the deck) into a URL.
 */
/** @param {{ lesson: any, page: any, picture: (value?: string) => string | null, student?: boolean, onCheck?: (block: number) => void, done?: Record<number, boolean>, Play?: any, assetBase?: string, wide?: boolean, arranging?: boolean }} props */
export function LessonPageView({ lesson, page, picture, student = false, onCheck, done = {}, Play = ActivityPreview, assetBase = '/', wide = false, arranging = false, only = null, slideOf = null, reveal = null }) {
  // One slide of the page (slidesOf): only its pieces, none of the page's own in-page stages.
  const slide = Array.isArray(only)
  /*
   * A page's next slide opens under the ones before it (November 9, 2026: "when they click next on a multi-part example, maybe it
   * could scroll them down rather than onto a fully new slide"): the walkthrough shows every slide of the page so far, and the
   * newest one scrolls into view.
   */
  const slideRef = useRef(null)
  useEffect(() => {
    if (reveal === null || reveal === undefined || !slideRef.current) return
    const el = slideRef.current.querySelector(`[data-blk="${reveal}"]`)
    if (el && el.previousElementSibling) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [reveal])
  const [term, setTerm] = useState(null)
  const [shown, setShown] = useState({})
  const [turned, setTurned] = useState({})
  const [videoStage, setVideoStage] = useState(false)
  const [exampleAttempt, setExampleAttempt] = useState(false)
  const viewportRef = useRef(null)
  const [canvasScale, setCanvasScale] = useState(1)
  const [canvasHeight, setCanvasHeight] = useState(0)
  useEffect(() => {
    const view = viewportRef.current
    if (!view) return
    const fit = () => {
      const canvas = view.querySelector('.llw-canvas')
      if (!canvas) return
      const scale = view.clientWidth / 1200
      // The card's padding sits outside the arrangement height, so the window has to follow the whole card.
      const next = canvas.offsetHeight * scale
      setCanvasScale((old) => Math.abs(old - scale) < 0.001 ? old : scale)
      setCanvasHeight((old) => Math.abs(old - next) < 0.5 ? old : next)
    }
    fit()
    const obs = new ResizeObserver(fit)
    obs.observe(view)
    return () => obs.disconnect()
  }, [page.arrangement])
  const boxProps = (key) => {
    const box = page.arrangement?.items?.[key]
    return { 'data-layout-key': key, ...(box ? { style: { left: box.x, top: box.y, width: box.w, height: box.h } } : {}) }
  }
  const cast = useMemo(() => new Map((lesson.cast || []).map((c) => [c.name.toLowerCase(), c])), [lesson])
  const glossary = useMemo(() => new Map((lesson.glossary || []).map((g) => [g.term.toLowerCase(), g])), [lesson])
  // A page with no slide of its own (Vocabulary, when the deck has none) shows the lesson's first scene.
  const sceneOf = page.scene || (lesson.pages || []).find((p) => p.scene)?.scene
  const scene = sceneOf ? picture(sceneOf) : null
  const meaning = term ? glossary.get(term.toLowerCase()) : null
  // A word's meaning opens right where the words are (October 26, 2026: "I don't want it to pop up from the bottom - it should
  // just expand down right there, give the definition of the word, and the example").
  const wordDef = term ? (
    <div className="llw-word-def" role="region" aria-live="polite" aria-label={term}>
      <h4>{term}</h4>
      <p>{meaning ? meaning.meaning : 'Ask your teacher what this word means.'}</p>
      {meaning?.example && <div className="eg"><b>Example</b>{meaning.example}</div>}
    </div>
  ) : null
  const blocks = page.walk || []
  const exampleFlow = page.type === 'example' ? (page.flow || 'static-attempt') : null
  const exampleStage = student && !!exampleFlow && !slide
  const exampleCardIndexes = blocks.map((b, i) => b.kind === 'cards' ? i : -1).filter((i) => i >= 0)
  const exampleVideoIndexes = blocks.map((b, i) => b.kind === 'video' ? i : -1).filter((i) => i >= 0)
  const exampleTeachingExists = blocks.some((b) => b.kind !== 'check' && b.kind !== 'video') || (!blocks.length && !!String(page.body || '').trim())
  const exampleHasAttempt = blocks.some((b) => b.kind === 'check')
  const exampleCanAttempt = exampleHasAttempt && (exampleFlow === 'cards-attempt'
    ? exampleCardIndexes.length > 0 && exampleCardIndexes.every((i) => turned[i] || done[i])
    : exampleFlow === 'video-attempt'
      ? exampleVideoIndexes.length > 0 && exampleVideoIndexes.every((i) => done[i])
      : exampleTeachingExists)
  // A page with a video (Kennady, October 27, 2026: "have it take the whole area and not use the vocab words ... the example
  // shows up AFTER they watch the video"): the video fills the page on its own, and what follows it appears once it has
  // played to the end. The CMS review shows the whole page.
  const vid = blocks.findIndex((b) => b.kind === 'video' && videoReady(b))
  const videoFirst = vid >= 0
  const cardsFirst = page.flow === 'cards-video' && blocks.some((b) => b.kind === 'cards')
  const cardsStaged = cardsFirst && !slide
  const exampleCardsFirst = student && exampleFlow === 'cards-attempt'
  const cardsDone = blocks.every((b, i) => b.kind !== 'cards' || turned[i] || done[i])
  const waiting = videoFirst && student && !done[vid] && !slide
  const hiddenBlock = (b, i) => {
    if (slide) return !only.includes(i)
    if (exampleStage) {
      if (exampleAttempt) return b.kind !== 'check'
      if (exampleFlow === 'video-attempt') return b.kind !== 'video'
      return b.kind === 'check' || b.kind === 'video'
    }
    return student && cardsStaged ? (videoStage ? b.kind !== 'video' : b.kind === 'video') : waiting && i > vid
  }
  const revealRef = useRef(null)
  // Scrolls to what the video uncovered, once, when it ends on this visit (not when the page opens already watched).
  const revealedRef = useRef(!waiting)
  useEffect(() => {
    if (waiting || revealedRef.current) return
    revealedRef.current = true
    revealRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [waiting])
  // Read aloud (November 2, 2026: "I need the option to have things read aloud to students"): the lesson turns it on, and every
  // piece with words gets a listen button. An arranged page places its own (Arrange page, per box).
  const speak = !!lesson.readAloud && !page.arrangement
  const spoken = (b) => b.kind === 'read' ? [b.title, b.text].filter(Boolean).join('. ')
    : b.kind === 'steps' ? b.steps.map((st, k) => `Step ${k + 1}. ${st.text}${st.why ? ` ${st.why}` : ''}`).join(' ')
    : b.kind === 'connect' ? `${CONNECT_LABEL[b.connect] || 'Talk about it'}. ${b.text}`
    : ['target', 'text', 'callout'].includes(b.kind) ? b.text : ''
  // One piece as the student sees it; the editor (the CMS) draws the same pieces.
  const piece = (b, i) => {
          if (b.kind === 'target') return <div key={i} className="llw-target"><Rich text={b.text} onTerm={setTerm} /></div>
          if (b.kind === 'text') return paragraphs(b.text).map((p, k) => <p key={`${i}-${k}`}><Rich text={p} onTerm={setTerm} /></p>)
          if (b.kind === 'cards' && (b.flip || cardsFirst || exampleCardsFirst)) return <FlipCards key={i} cards={b.cards} speak={speak} itemProps={(k) => boxProps(`b${i}-card${k}`)} onTerm={setTerm} done={!!done[i]} onAll={() => { setTurned((old) => ({ ...old, [i]: true })); if (onCheck) onCheck(i) }} />
          if (b.kind === 'cards') return (
            <div key={i} className="llw-cards">
              {b.cards.map((c, k) => (
                <section key={k} className="llw-card-box" {...boxProps(`b${i}-card${k}`)} style={{ '--c': CARD_INK[k % CARD_INK.length], ...boxProps(`b${i}-card${k}`).style }}>
                  <h3>{c.title}</h3>
                  <p><Rich text={c.text} onTerm={setTerm} /></p>
                  {c.example && <p className="eg"><b>Example:</b><Rich text={c.example} onTerm={setTerm} /></p>}
                  {speak && <ReadAloud text={[c.title, c.text, c.example && `For example: ${c.example}`].filter(Boolean).join('. ')} label={`Read aloud: ${c.title}`} className="llw-read-button llw-read-corner" />}
                </section>
              ))}
            </div>
          )
          if (b.kind === 'callout') return <div key={i} className="llw-callout"><Rich text={b.text} onTerm={setTerm} /></div>
          if (b.kind === 'read' && b.look) return (
            <figure key={i} className={`llw-thing look-${b.look}`}>
              <div className="t"><Rich text={b.text} onTerm={setTerm} /></div>
              {b.look === 'sign' && <span className="posts" aria-hidden="true"><i /><i /></span>}
              {b.title && <figcaption>{b.title}</figcaption>}
            </figure>
          )
          if (b.kind === 'read') return <div key={i} className="llw-read">{b.title && <b>{b.title}</b>}<Rich text={b.text} onTerm={setTerm} /></div>
          if (b.kind === 'say') {
            const who = cast.get(String(b.who).toLowerCase()), src = who?.art ? picture(who.art) : null
            return (
              <div key={i} className={'llw-says' + (src ? '' : ' noart') + (who?.faces === 'right' ? ' left' : '')}>
                {src && <img src={src} alt={b.who} {...boxProps(`b${i}-character`)} />}
                <div className="llw-bubble" {...boxProps(`b${i}-bubble`)}><b>{b.who}</b><Rich text={b.text} onTerm={setTerm} />{speak && <ReadAloud text={b.text} label={`Read aloud: what ${b.who} says`} className="llw-read-button llw-read-corner" />}</div>
              </div>
            )
          }
          if (b.kind === 'steps') {
            const upTo = student ? (shown[i] ?? 1) : b.steps.length
            return (
              <React.Fragment key={i}>
                <ol className="llw-steps">
                  {b.steps.slice(0, upTo).map((s, k) => (
                    <li key={k} data-n={k + 1}><Rich text={s.text} onTerm={setTerm} />{s.why && <div className="llw-why"><Rich text={s.why} onTerm={setTerm} /></div>}</li>
                  ))}
                </ol>
                {upTo < b.steps.length && <button type="button" className="llw-more" onClick={() => setShown((m) => ({ ...m, [i]: upTo + 1 }))}>Next step →</button>}
              </React.Fragment>
            )
          }
          if (b.kind === 'connect') return (
            <div key={i} className="llw-connect">
              <img src={CONNECT_ICON(assetBase, b.connect)} alt="" />
              <div><b>{CONNECT_LABEL[b.connect] || 'Talk about it'}</b><p><Rich text={b.text} onTerm={setTerm} /></p></div>
            </div>
          )
          if (b.kind === 'picture') {
            const src = picture(b.art)
            return src ? <figure key={i} className="llw-figure"><img src={src} alt={b.caption || ''} />{b.caption && <figcaption>{b.caption}</figcaption>}</figure> : null
          }
          if (b.kind === 'video') return <LessonVideo key={i} piece={b} autoPlay={student && cardsStaged && videoStage} done={!!done[i]} onDone={() => onCheck && onCheck(i)} />
          if (b.kind === 'check') return (
            <section key={i} className={'llw-check' + (done[i] ? ' done' : '')} aria-label="Check">
              {student && done[i] && <div className="llw-cheer" role="status"><span aria-hidden="true">⭐</span> Nice work! You finished this one.</div>}
              <div className="llw-check-head">Your turn{done[i] && <span>✓ Done</span>}</div>
              <div className="prw"><Play act={onceSaid(b.activity)} onDone={() => onCheck && onCheck(i)} doneLabel="Done ✓" /></div>
            </section>
          )
          return null
  }
  const card = (
      <article className={'llw-card' + (page.arrangement ? ' llw-canvas' : '') + (scene && !wide && !page.arrangement ? ' llw-over' : '')} style={page.arrangement ? { height: page.arrangement.height, transform: `scale(${canvasScale})` } : undefined}>
        {speak ? <div className="llw-h-row"><h2 className="llw-h">{pageTitle(page)}</h2><ReadAloud text={pageTitle(page)} label="Read aloud: the page title" /></div> : <h2 className="llw-h" {...boxProps("heading")}>{pageTitle(page)}</h2>}
        {!blocks.length && (page.body ? paragraphs(page.body).map((p, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>) : page.type === 'breakout_title' ? null : <p className="llw-empty">This page has nothing on it yet.</p>)}
        <div className="llw-flow">{blocks.map((b, i) => (hiddenBlock(b, i) ? null : <div key={i} {...(["say", "cards"].includes(b.kind) ? {} : boxProps(`b${i}`))} ref={videoFirst && i === vid + 1 ? revealRef : undefined} className={`llw-blk w-${b.width || 'full'} tone-${b.tone || TONE_OF[b.kind] || 'teal'}` + (videoFirst && student && i > vid ? ' llw-after' : '') + (speak && spoken(b) ? ' llw-can-read' : '')}>{piece(b, i)}{speak && spoken(b) && <ReadAloud text={spoken(b)} label={`Read aloud: ${b.kind === 'read' && b.title ? b.title : 'this part'}`} className="llw-read-button llw-read-corner" />}</div>))}</div>
        {page.arrangement && Object.entries(page.arrangement.items).map(([key, box]) => {
          if (!box.readAloud || key.endsWith('-character')) return null
          const match = /^b(\d+)(?:-card(\d+)|-bubble)?$/.exec(key)
          const b = match ? blocks[Number(match[1])] : null
          if (b && hiddenBlock(b, Number(match[1]))) return null
          const c = b?.kind === 'cards' && match?.[2] !== undefined ? b.cards[Number(match[2])] : null
          const text = key === 'heading' ? pageTitle(page) : c ? [c.title, c.text, c.example].filter(Boolean).join('. ') : b?.text || b?.caption || ''
          return text ? <ReadAloud key={key} text={text} label={`Read aloud: ${c?.title || (key === 'heading' ? pageTitle(page) : b?.who || 'text')}`} style={{ position: 'absolute', left: box.x + box.w - 38, top: box.y + 2 }} /> : null
        })}
      </article>
  )
  // The side column holds what the student uses on this page: what is left to do, and its words. The characters speak in
  // the page itself (October 21, 2026: a guide card beside it "just looks like fluff").
  const words = wordsOn(page)
  // The title page is the lesson's cover (October 21, 2026: "Now the title slide turned out so boring"): the scene across
  // the whole page, the title large on it, and one character with the opening line in a little speech bubble (October 26,
  // 2026: the whole cast lined up with name labels "looks weird"; "just one character with a little dialogue box").
  const flat = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
  // The lesson's I can statement sits on the cover, under the title (November 9, 2026: "include the learning target directly on the title slide").
  const goal = page.type === 'breakout_title' ? blocks.find((b) => b.kind === 'target' && String(b.text || '').trim()) : null
  const hook = page.type === 'breakout_title' ? blocks.find((b) => b.kind === 'text' && flat(b.text) !== flat(page.heading)) || (goal ? null : blocks.find((b) => b.kind === 'target' && flat(b.text) !== flat(page.heading))) : null
  const line = page.type === 'breakout_title' ? blocks.find((b) => b.kind === 'say') : null
  const lineup = (lesson.cast || []).map((c) => ({ ...c, src: c.art ? picture(c.art) : null })).filter((c) => c.src)
  const speaker = line ? lineup.findIndex((c) => c.name.toLowerCase() === String(line.who).toLowerCase()) : -1
  const chosen = lesson.front ? lineup.find((c) => c.name.toLowerCase() === String(lesson.front).toLowerCase()) : null
  const one = chosen || (speaker >= 0 ? lineup[speaker] : lineup[0] || null)
  const cover = (
    <section className="llw-cover" aria-label={page.heading}>
      {scene && <img className="llw-cover-bg" src={scene} alt="" />}
      <div className="llw-cover-copy">
        <span>Today’s lesson</span>
        <h1>{page.heading}</h1>
        {goal && <div className="llw-cover-goal"><b>Goal</b><div><Rich text={goal.text} onTerm={setTerm} /></div></div>}
        {hook && <p><Rich text={hook.text} onTerm={setTerm} /></p>}
      </div>
      <div>
        {line && !one && <div className="llw-cover-say"><b>{line.who}</b><Rich text={line.text} onTerm={setTerm} /></div>}
        {one && <div className="llw-cover-cast">
          <figure>
            {/* the chosen cover character says the opening line, whoever Claude first gave it to */}
            {line && <div className="llw-cover-say"><b>{one.name}</b><Rich text={line.text} onTerm={setTerm} /></div>}
            <img src={one.src} alt={one.name} />
          </figure>
        </div>}
      </div>
    </section>
  )
  return (
    <div className={'llw' + (wide ? ' llw-wide' : '') + (youngReader(lesson) ? ' llw-young' : '')}>
      <style>{CSS}</style>
      {student && cardsStaged && videoStage ? piece(blocks[vid], vid) : slide && page.type !== 'breakout_title' && !page.arrangement ? (
        <section ref={slideRef} className={'llw-slide' + (scene ? ' has-scene' : '')} aria-label={pageTitle(page)}>
          {/* the page's scene from its theme or slide fills the slide behind the white panel (November 9, 2026: "I want their cute little backgrounds") */}
          {scene && <img className="llw-slide-bg" src={scene} alt="" />}
          {(() => {
            const head = (
              <header className="llw-slide-head">
                <span>{sectionOf(page)} · {shownLabel(page)}{slideOf && slideOf.of > 1 ? ` · ${slideOf.n + 1} of ${slideOf.of}` : ''}</span>
                <h2>{slideTitle(page)}</h2>
                {speak && <ReadAloud text={slideTitle(page)} label="Read aloud: the page title" />}
              </header>
            )
            const blockEl = (b, i) => <div key={i} data-blk={i} className={`llw-blk w-full tone-${b.tone || TONE_OF[b.kind] || 'teal'} k-${b.kind}` + (speak && spoken(b) ? ' llw-can-read' : '')}>{piece(b, i)}{speak && spoken(b) && <ReadAloud text={spoken(b)} label={`Read aloud: ${b.kind === 'read' && b.title ? b.title : 'this part'}`} className="llw-read-button llw-read-corner" />}</div>
            const shown = blocks.map((b, i) => (hiddenBlock(b, i) ? null : i)).filter((i) => i !== null)
            /*
             * The slide's main piece fills the window beside a side column (November 10, 2026: "format a little differently so the
             * instruction is just right there in the window? We can use the sides as needed for whatever info we are scrolling up or
             * down for"): the heading, the target, the lines that lead in and the page's earlier parts (the poster an activity is
             * about) stay in the side column; the video, the cards or the activity is in the window, sized to fit it.
             */
            const mainAt = [...(slideOf?.only || only || [])].reverse().find((i) => blocks[i] && SLIDE_MAIN.has(blocks[i].kind) && shown.includes(i))
            if (mainAt === undefined) return (
              <div className="llw-slide-panel">
                {head}
                <div className="llw-slide-body llw-flow">
                  {!blocks.length && page.body && paragraphs(page.body).map((p, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}
                  {shown.map((i) => blockEl(blocks[i], i))}
                </div>
                {wordDef}
              </div>
            )
            return (
              <div className="llw-slide-panel split">
                <aside className="llw-slide-side">
                  {head}
                  <div className="llw-slide-body llw-flow">{shown.filter((i) => i !== mainAt).map((i) => blockEl(blocks[i], i))}</div>
                  {wordDef}
                </aside>
                <div className={`llw-slide-main k-${blocks[mainAt].kind}`}>{blockEl(blocks[mainAt], mainAt)}</div>
              </div>
            )
          })()}
        </section>
      ) : page.arrangement ? <>
        {/* The scene stays above an arranged page (October 29, 2026: arranging had dropped the background). */}
        {scene && <figure className="llw-scene"><img src={scene} alt="" /></figure>}
        <div className="llw-canvas-viewport" ref={viewportRef} style={{ height: canvasHeight || page.arrangement.height * canvasScale }}>{card}</div>
        {wordDef}
      </> : page.type === 'breakout_title' && !arranging ? cover : wide ? (
        <>
          <figure className="llw-hero">{scene && <img src={scene} alt="" />}<figcaption className="llw-hero-copy"><span>{sectionOf(page)}</span><h2>{pageTitle(page)}</h2></figcaption></figure>
          <div className={'llw-cols' + (videoFirst ? ' solo video' : words.length ? '' : ' solo')}>
            {card}
            {/* a video page keeps the whole width; a word tapped in it opens under the page */}
            {videoFirst && wordDef}
            {/* only the page's words: what is left to do is already in the footer ("Finish the activity to go on") */}
            {!videoFirst && !!words.length && <aside className="llw-aside">
              {!!words.length && <div className="llw-words"><h3>Words to know</h3><div>{words.map((w) => <button key={w} type="button" aria-expanded={!!term && term.toLowerCase() === w.toLowerCase()} onClick={() => setTerm(term && term.toLowerCase() === w.toLowerCase() ? null : w)}>{w}</button>)}</div>{wordDef}</div>}
            </aside>}
          </div>
        </>
      ) : (
        <>
          {scene && <figure className="llw-scene"><img src={scene} alt="" /></figure>}
          {card}
          {wordDef}
        </>
      )}
      {student && cardsStaged && <div className="llw-next-video">{!videoStage ? <><button type="button" className="llw-btn" disabled={!cardsDone || !videoFirst} onClick={() => setVideoStage(true)}>Next: Watch video →</button><span>{!cardsDone ? 'Turn over every card to continue.' : !videoFirst ? 'Your video is not ready yet.' : ''}</span></> : <button type="button" className="llw-btn" onClick={() => setVideoStage(false)}>← Review the cards</button>}</div>}
      {exampleStage && <div className="llw-next-video llw-example-stage" aria-live="polite">{exampleAttempt ? (
        <button type="button" className="llw-btn" onClick={() => setExampleAttempt(false)}>← Review the instruction</button>
      ) : (
        <><button type="button" className="llw-btn" disabled={!exampleCanAttempt} onClick={() => setExampleAttempt(true)}>{exampleFlow === 'static-attempt' ? "I've read the example → My turn" : 'Next: Your turn →'}</button>
          <span>{exampleFlow === 'cards-attempt' ? 'Flip through every card before you try it.' : exampleFlow === 'video-attempt' ? 'Watch the whole video before you try it.' : exampleTeachingExists ? 'Read the example, then continue to your attempt.' : 'Add static instruction before the student attempt.'}</span></>
      )}</div>}
    </div>
  )
}

/** The pages a student walks through: pages with nothing on them stay out of the way; the title page always opens the lesson. */
export const walkPages = (lesson) => withoutExtras(lesson).pages?.filter((p) => p.type === 'breakout_title' || (p.walk && p.walk.length) || String(p.body || '').trim()) || []

/**
 * A lesson without its Learning Target, Warm-Up and Exit Ticket pages (November 9, 2026: "remove the warmup and the exit ticket
 * and I want to include the learning target directly on the title slide"), whenever it was written: the I can statement moves
 * to the title page. A lesson already in that shape comes back as it is.
 */
export function withoutExtras(lesson) {
  const pages = lesson?.pages || []
  const dropped = (p) => p.type === 'learning_target' || p.type === 'warm_up' || p.type === 'exit_ticket'
  if (!pages.some(dropped)) return lesson
  const targetBlock = (p) => (p?.walk || []).find((b) => b.kind === 'target' && String(b.text || '').trim())
  const old = pages.find((p) => p.type === 'learning_target')
  const line = String(old?.body || '').split('\n').map((l) => l.trim()).find((l) => /^(learning target\b|i can\b)/i.test(l)) || ''
  const target = targetBlock(old)?.text || line.replace(/^learning target\s*[:.]?\s*/i, '')
  return { ...lesson, pages: pages.filter((p) => !dropped(p)).map((p) => (p.type !== 'breakout_title' || !target || targetBlock(p) ? p : { ...p, walk: [{ kind: 'target', text: target }, ...(p.walk || [])] })) }
}

/** A whole lesson, page by page. Next opens once every check on the page is done. */
/** @param {{ lesson: any, picture: (value?: string) => string | null, onFinish?: () => void, finishLabel?: string, Play?: any, assetBase?: string, wide?: boolean, arranging?: boolean }} props */
export function LessonWalkthrough({ lesson: given, picture, onFinish, finishLabel = "Finish lesson", Play = ActivityPreview, assetBase = '/', wide = false }) {
  const lesson = useMemo(() => withoutExtras(given), [given])
  const pages = walkPages(lesson)
  // The lesson plays slide by slide (slidesOf): one thing at a time, nothing to scroll through.
  const slides = useMemo(() => lessonSlides(pages), [lesson]) // eslint-disable-line react-hooks/exhaustive-deps
  const [at, setAt] = useState(0)
  const [done, setDone] = useState({})
  // A new page starts at the top; the next slide of the same page opens under the last one (LessonPageView `reveal`).
  const pageNow = slides[at]?.pageAt
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo?.({ top: 0, behavior: 'smooth' }) }, [pageNow])
  const slide = slides[at]
  if (!slide) return null
  const { page, pageAt } = slide
  const mine = done[pageAt] || {}
  const { open, wait } = slideGate(slide, mine)
  const last = at === slides.length - 1
  // The trail: the lesson's sections in order, a dot a slide, the student's slide lit.
  const sections = slides.reduce((out, sl, i) => { const name = sectionOf(sl.page); const lastOne = out[out.length - 1]; if (lastOne && lastOne.name === name) lastOne.slides.push(i); else out.push({ name, slides: [i] }); return out }, [])
  return (
    <div className={'llw' + (wide ? ' llw-wide' : '') + (youngReader(lesson) ? ' llw-young' : '')}>
      <style>{CSS}</style>
      {wide ? (
        <nav className="llw-trail" aria-label="Lesson progress">
          {sections.map((sec) => (
            <section key={sec.name} className={sec.slides.includes(at) ? 'on' : ''}>
              <small>{sec.name}</small>
              <div>{sec.slides.map((i) => <i key={i} className={i === at ? 'on' : i < at ? 'seen' : ''} title={pageTitle(slides[i].page)} />)}</div>
            </section>
          ))}
        </nav>
      ) : <div className="llw-progress" aria-hidden="true"><i style={{ width: `${((at + 1) / slides.length) * 100}%` }} /></div>}
      <LessonPageView key={pageAt} lesson={lesson} page={page} picture={picture} student done={mine} Play={Play} assetBase={assetBase} wide={wide} only={shownOn(slides, at)} slideOf={slide} reveal={slide.only[0]}
        onCheck={(i) => setDone((d) => ({ ...d, [pageAt]: { ...(d[pageAt] || {}), [i]: true } }))} />
      <div className="llw-nav">
        <button type="button" className="llw-btn" disabled={at === 0} onClick={() => setAt(at - 1)}>← Back</button>
        <span className="llw-wait">{open ? `${at + 1} of ${slides.length}` : wait}</span>
        <button type="button" className="llw-btn llw-go" disabled={!open} onClick={() => (last ? onFinish && onFinish() : setAt(at + 1))}>{last ? finishLabel : 'Next →'}</button>
      </div>
    </div>
  )
}

/*
 * The student site's lesson frame (November 9, 2026: "I also want the student preview to show like this exact structure from the
 * site it is going to live within"), shared by the CMS student preview and the LoneStar student app (src/student/LitLabLesson.jsx):
 * the lesson's pages down a narrow rail (grouped Get ready / Part 1 / Part 2, a "1 of 9 steps" meter, the guide's tip under them),
 * the slides in the wide stage beside it on the scene, and Back / Step n of N / Continue pinned to the bottom. The student app
 * styles these classes in its own stylesheet (with each grade band's look); `styled` adds the same rules here for the CMS.
 */
const frameName = (p) => (p.type === 'breakout_title' ? 'Welcome' : shownLabel(p))
export const frameTip = (p) => ({ breakout_title: 'Welcome! Let us find out what today is about.', learning_target: 'This is what you will be able to do by the end.', warm_up: 'A quick warm-up to wake up your brain!', vocabulary: 'Tap a word to see what it means.', instruction: 'Watch and read closely. This is the big idea.', group_instruction: 'Talk it over. Explaining it helps you learn it.', example: 'Follow along with the example, then try it.', checkpoint: 'Your turn! Show what you know.', checkpoint_b: 'One more try to lock it in.', exit_ticket: 'Last stop! Show what you learned today.' })[p.type] || 'Keep going. You have got this!'
function FrameTip({ page, guide }) {
  return (
    <div className="llx-tip">
      {guide?.img && <img src={guide.img} alt="" />}
      <p><b>{guide?.name || 'Tip'}</b>{frameTip(page)}</p>
    </div>
  )
}
/** @param {{ lesson: any, picture: (value?: string) => string | null, Play?: any, assetBase?: string, chip?: string, background?: string, guide?: { img?: string, name?: string }, Tip?: any, complete?: boolean, draft?: any, onDraft?: (d: any) => void, onDone?: () => void, onBack?: () => void, backLabel?: string, exitLabel?: string, finishLabel?: string, styled?: boolean, preview?: boolean }} props */
export function LessonFrame({ lesson, picture, Play = ActivityPreview, assetBase = '/', chip = 'Lit Lab', background = '', guide = null, Tip = null, complete = false, draft = null, onDraft = () => {}, onDone = () => {}, onBack = () => {}, backLabel = '← Back to my pathway', exitLabel = 'Exit to my pathway', finishLabel = 'Finish lesson & start practice ✓', styled = false, preview = false }) {
  // A publisher previewing (November 10, 2026: "When I am previewing, I need to be able to just continue without watching the
  // video/doing the activity"): Continue never waits, and every page in the rail opens. Students still wait.
  const pages = useMemo(() => walkPages(lesson), [lesson])
  // Slide by slide (slidesOf): a page's next part opens under the last one; a new page starts at the top.
  const slides = useMemo(() => lessonSlides(pages), [pages])
  const total = Math.max(1, slides.length)
  const [at, setAt] = useState(Math.min(draft?.slide || 0, total - 1))
  const [done, setDone] = useState(draft?.done || {})
  const [reached, setReached] = useState(Math.max(draft?.reached || 0, at))
  const save = (patch) => onDraft({ slide: at, done, reached, ...patch })
  const go = (i) => {
    const r = Math.max(reached, i)
    const samePage = slides[i]?.pageAt === slides[at]?.pageAt
    setAt(i); setReached(r); save({ slide: i, reached: r }); if (!samePage && typeof window !== 'undefined') window.scrollTo(0, 0)
  }
  const slide = slides[at]
  if (!slide) return null
  const { page, pageAt } = slide
  const mine = done[pageAt] || {}
  const { open, wait } = slideGate(slide, mine)
  const last = at === slides.length - 1
  const pct = Math.round(((at + 1) / total) * 100)
  const firstOf = pages.map((_, p) => slides.findIndex((sl) => sl.pageAt === p))
  const sections = pages.reduce((out, p, i) => { const name = sectionOf(p); const prev = out[out.length - 1]; if (prev && prev.name === name) prev.pages.push(i); else out.push({ name, pages: [i] }); return out }, [])
  const finish = complete ? onBack : onDone
  const canGo = open || preview
  const opened = preview ? slides.length - 1 : reached
  return (
    <div className={'llx ll-lesson ll-walk' + (styled ? ' llx-own' : '')}>
      {styled && <style>{FRAME_CSS}</style>}
      {background && <div aria-hidden className="scene-bg" style={{ backgroundImage: `url(${background})` }} />}
      <div className="llx-in">
        <aside className="llx-rail" aria-label="Lesson steps">
          <span className="llx-chip">{chip}</span>
          <h1 className="llx-title">{lesson.title}</h1>
          <div className="llx-meter" aria-label={`Step ${at + 1} of ${total}`}>
            <span className="llx-meter-txt"><b>{at + 1}</b> of {total} steps</span>
            <span className="llx-meter-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          <div className="llx-sections">
            {sections.map((sec) => {
              const here = sec.pages.includes(pageAt), finished = !here && sec.pages.every((p) => firstOf[p] < reached)
              return (
                <section key={sec.name} className={'llx-sec' + (here ? ' on' : '') + (finished ? ' done' : '')}>
                  <button type="button" className="llx-sec-head" disabled={firstOf[sec.pages[0]] > opened} onClick={() => !here && firstOf[sec.pages[0]] <= opened && go(firstOf[sec.pages[0]])} aria-expanded={here}>
                    <span>{sec.name}</span><small>{finished ? '✓ Done' : `${sec.pages.length} ${sec.pages.length === 1 ? 'page' : 'pages'}`}</small>
                  </button>
                  {here && (
                    <ol className="llx-steps">
                      {sec.pages.map((p) => {
                        const on = p === pageAt, past = p < pageAt
                        return (
                          <li key={p}>
                            <button type="button" className={'llx-step' + (on ? ' on' : '') + (past ? ' past' : '')} disabled={firstOf[p] > opened} onClick={() => firstOf[p] <= opened && !on && go(firstOf[p])} aria-current={on ? 'step' : undefined} title={pageTitle(pages[p])}>
                              <span className="llx-step-n" aria-hidden="true">{past ? '✓' : p + 1}</span>
                              <span className="llx-step-name">{frameName(pages[p])}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </section>
              )
            })}
          </div>
          {Tip ? <Tip page={page} text={frameTip(page)} /> : <FrameTip page={page} guide={guide} />}
        </aside>
        <main className="llx-page">
          <div className={'llw llw-wide' + (youngReader(lesson) ? ' llw-young' : '')}>
            <style>{CSS}</style>
            <LessonPageView key={pageAt} lesson={lesson} page={page} picture={picture} student done={mine} Play={Play} assetBase={assetBase} wide only={shownOn(slides, at)} slideOf={slide} reveal={slide.only[0]}
              onCheck={(i) => { const next = { ...done, [pageAt]: { ...(done[pageAt] || {}), [i]: true } }; setDone(next); save({ done: next }) }} />
          </div>
        </main>
      </div>
      <div className="lsn-nav">
        <div className="lsn-nav-in">
          <button type="button" className="lsn-btn ghost" onClick={at === 0 ? onBack : () => go(at - 1)}>{at === 0 ? backLabel : '← Back'}</button>
          {at > 0 && <button type="button" className="lsn-exit" onClick={onBack}>{exitLabel}</button>}
          <div className="lsn-nav-prog" aria-label={`Step ${at + 1} of ${total}`}>
            <span className="lsn-nav-step">{open ? `Step ${at + 1} of ${total} · ${slideTitle(page)}` : preview ? `${wait} · preview: you can skip` : wait}</span>
            <span className="lsn-nav-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          {last
            ? <button type="button" className="lsn-btn done" disabled={!canGo} title={open ? '' : wait} onClick={finish}>{complete ? backLabel.replace(/^←\s*/, '') : finishLabel}</button>
            : <button type="button" className={'lsn-btn' + (open ? '' : ' lsn-skip')} disabled={!canGo} title={open ? '' : wait} onClick={() => go(at + 1)}>{open ? 'Continue →' : 'Skip ahead →'}</button>}
        </div>
      </div>
    </div>
  )
}
// The student site's rules for the frame (LoneStar src/theme.css .scene-bg, .lsn-nav*, .lsn-btn, .lsn-exit and
// src/student/StudentPathway.css .llx*), for the CMS preview, where that stylesheet is not loaded.
const FRAME_CSS = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
.llx-own{--scene-deep:#01172d;--navy:#02384d;--teal:#035c78;--ink:#14344a;--gold:#f5b400;--gold-line:rgba(245,180,0,.45);--shadow:0 1px 3px rgba(2,56,77,.07),0 8px 24px rgba(2,56,77,.06);position:relative;min-height:100vh;padding:16px clamp(12px,1.6vw,24px) 96px;color:var(--ink);font-family:'Manrope',system-ui,sans-serif;background:#f6f9fb}
.llx-own button{font-family:inherit;cursor:pointer;border:none;background:none}
.llx-own .scene-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-position:center;background-size:cover;background-repeat:no-repeat;opacity:.22}
.llx-own .llx-in{position:relative;z-index:1;display:grid;grid-template-columns:clamp(200px,17vw,250px) minmax(0,1fr);gap:clamp(12px,1.4vw,20px);align-items:stretch}
.llx-own .llx-rail{background:linear-gradient(160deg,#eef6f9,#fff 45%);border:1px solid var(--gold-line);border-radius:20px;box-shadow:var(--shadow);position:sticky;top:80px;align-self:start;display:grid;gap:12px;padding:16px 14px}
.llx-own .llx-chip{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--teal)}
.llx-own .llx-title{margin:-4px 0 0;font-size:21px;font-weight:800;letter-spacing:-.02em;line-height:1.15;color:var(--navy);text-wrap:balance;font-family:inherit}
.llx-own .llx-meter{display:grid;gap:7px}
.llx-own .llx-meter-txt{font-size:13px;font-weight:700;color:#557489}
.llx-own .llx-meter-txt b{color:var(--navy)}
.llx-own .llx-meter-bar{height:8px;border-radius:999px;background:#e3eef3;overflow:hidden}
.llx-own .llx-meter-bar>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#02b2d5,var(--teal));transition:width .35s ease}
.llx-own .llx-steps{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.llx-own .llx-step{width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid transparent;border-radius:14px;background:transparent;text-align:left;font:inherit;color:#557489;cursor:pointer;transition:background .15s,border-color .15s}
.llx-own .llx-step:hover:not(:disabled){background:rgba(255,255,255,.8)}
.llx-own .llx-step:disabled{cursor:default;opacity:.6}
.llx-own .llx-step.on{background:#fff;border-color:var(--gold-line);color:var(--navy);box-shadow:0 2px 8px rgba(2,56,77,.08)}
.llx-own .llx-step.past{color:var(--ink)}
.llx-own .llx-step:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.llx-own .llx-step-n{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#fff;border:1.5px solid #cfdfe7;color:#7d93a6;font-size:13.5px;font-weight:800}
.llx-own .llx-step.on .llx-step-n{background:var(--navy);border-color:var(--navy);color:#fff;box-shadow:0 0 0 2px #fff,0 0 0 4px var(--gold)}
.llx-own .llx-step.past .llx-step-n{background:#d9f2fb;border-color:#d9f2fb;color:var(--teal)}
.llx-own .llx-step-name{font-size:13.5px;font-weight:700;line-height:1.3}
.llx-own .llx-tip{display:flex;align-items:flex-end;gap:10px;margin-top:2px;padding-top:14px;border-top:1px solid var(--gold-line)}
.llx-own .llx-tip img{width:44px;height:44px;object-fit:contain;flex:none;filter:drop-shadow(0 4px 8px rgba(2,30,60,.25))}
.llx-own .llx-tip p{margin:0;padding:9px 11px;border-radius:14px 14px 14px 4px;background:#fff;border:1px solid var(--gold-line);font-size:12.5px;font-weight:600;line-height:1.4;color:var(--ink)}
.llx-own .llx-tip b{display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:2px}
.llx-own .llx-sections{display:grid;gap:8px}
.llx-own .llx-sec{display:grid;gap:6px}
.llx-own .llx-sec-head{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:transparent;font:inherit;cursor:pointer;color:#557489}
.llx-own .llx-sec-head span{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.llx-own .llx-sec-head small{font-size:12px;font-weight:700;color:#7d93a6}
.llx-own .llx-sec.on .llx-sec-head{color:var(--teal);cursor:default}
.llx-own .llx-sec.done .llx-sec-head small{color:#16935a}
.llx-own .llx-sec-head:disabled{cursor:default;opacity:.6}
.llx-own .llx-sec-head:hover:not(:disabled){background:rgba(255,255,255,.8)}
.llx-own .llx-page{min-width:0}
.llx-own .llx-page .llw{font-size:17px}
.llx-own .lsn-nav{position:fixed;left:0;right:0;bottom:0;z-index:30;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:1px solid rgba(188,217,236,.8);box-shadow:0 -6px 20px rgba(2,20,50,.08)}
.llx-own .lsn-nav-in{margin:0 auto;padding:12px clamp(16px,2vw,32px);display:flex;align-items:center;gap:16px}
.llx-own .lsn-nav-prog{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.llx-own .lsn-nav-step{font-size:12.5px;font-weight:800;color:#0d2f55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.llx-own .lsn-nav-bar{width:min(360px,100%);height:8px;border-radius:999px;background:#e6eef3;overflow:hidden}
.llx-own .lsn-nav-bar>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#02b2d5,#0a7dba);transition:width .3s}
.llx-own .lsn-btn{padding:12px 26px;border-radius:12px;font-weight:800;font-size:15px;color:#fff;background:var(--navy);white-space:nowrap;box-shadow:0 1px 2px rgba(2,56,77,.14),0 0 0 1px var(--gold-line)}
.llx-own .lsn-btn:hover:not(:disabled){background:#024a64}
.llx-own .lsn-btn:disabled{background:#9fb3c4;box-shadow:none;cursor:not-allowed}
.llx-own .lsn-btn.ghost{background:#fff;color:#0d2f55;border:1.5px solid #bcd9ec;box-shadow:none}
.llx-own .lsn-btn.done{background:#2e9e6b}
.llx-own .lsn-btn.lsn-skip{background:#fff;color:var(--navy);border:1.5px dashed #9fb3c4;box-shadow:none}
.llx-own .lsn-btn.lsn-skip:hover{background:#f3f8fb}
.llx-own .lsn-btn:focus-visible{outline:3px solid #f0b429;outline-offset:2px}
.llx-own .lsn-exit{font-size:13px;font-weight:800;color:#0a7dba;background:none;padding:6px 4px;white-space:nowrap}
.llx-own .lsn-exit:hover{text-decoration:underline}
@media (max-width:860px){.llx-own .llx-in{grid-template-columns:1fr}.llx-own .llx-rail{position:static}}
@media (prefers-reduced-motion:reduce){.llx-own *{transition:none!important}}
`

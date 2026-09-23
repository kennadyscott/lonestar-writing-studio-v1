import { common } from './es/common.js'
import { home } from './es/home.js'
import { luna } from './es/luna.js'
import { writing } from './es/writing.js'
import { fluency } from './es/fluency.js'
import { proof } from './es/proof.js'
import { growth } from './es/growth.js'
import { misc } from './es/misc.js'
import { bridge } from './es/bridge.js'
import { simple } from './es/simple.js'

// One flat map, English string -> Spanish string. Split by area only so the
// files stay readable; later areas win on the rare duplicate.
export const es = { ...common, ...home, ...luna, ...writing, ...fluency, ...proof, ...growth, ...misc, ...bridge, ...simple }

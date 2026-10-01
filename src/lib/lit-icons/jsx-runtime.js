import { jsx as _jsx, jsxs as _jsxs, Fragment } from 'react/jsx-runtime'
import { withIcons } from './core.js'
export { Fragment }
export function jsx(type, props, key) { return _jsx(type, withIcons(type, props), key) }
export function jsxs(type, props, key) { return _jsxs(type, withIcons(type, props), key) }

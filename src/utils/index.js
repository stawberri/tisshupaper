import ResizeObserver from 'resize-observer-polyfill'
import { connect as originalConnect } from 'react-redux'

export function uniqueKey() {
  const now = Date.now()
  if (now !== uniqueKey.lastKeyTime) {
    uniqueKey.lastKeyTime = now
    uniqueKey.lastKeyNumber = 0
  } else uniqueKey.lastKeyNumber++

  return `${uniqueKey.lastKeyTime} | ${uniqueKey.lastKeyNumber}`
}

export function connect(...args) {
  args[3] = { pure: false, ...(args[3] || {}) }
  return originalConnect(...args)
}

export function resized(target, callback) {
  if (!resized.callbacks) {
    resized.callbacks = new WeakMap()
    resized.observer = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        const callback = resized.callbacks.get(entry.target)
        if (callback) callback(entry)
      }
    })
  }

  resized.callbacks.set(target, callback)
  resized.observer.observe(target)
  return () => resized.observer.unobserve(target)
}

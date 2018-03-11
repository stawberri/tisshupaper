import ResizeObserver from 'resize-observer-polyfill'

const callbacks = new WeakMap()
const resizeObserver = new ResizeObserver((entries, observer) => {
  for (const entry of entries) {
    const callback = callbacks.get(entry.target)
    if (callback) callback(entry)
  }
})

export default function observe(target, callback) {
  callbacks.set(target, callback)
  resizeObserver.observe(target)
  return () => resizeObserver.unobserve(target)
}

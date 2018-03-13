let lastKeyTime
let lastKeyNumber

export default function uniqueKey() {
  const now = Date.now()
  if (now !== lastKeyTime) {
    lastKeyTime = now
    lastKeyNumber = 0
  } else lastKeyNumber++

  return `${lastKeyTime} | ${lastKeyNumber}`
}

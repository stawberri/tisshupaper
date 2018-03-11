export function resize(img, box, cover) {
  const aspect = img.width / img.height
  let width = box.height * aspect
  let height = box.width / aspect

  if ((cover && width >= box.width) || (!cover && width <= box.width)) {
    height = box.height
  } else {
    width = box.width
  }

  return { width, height }
}

export function contained(a, b) {
  return a.width <= b.width && a.height <= b.height
}

export function coverage(a, b) {
  const width = Math.min(a.width, b.width)
  const height = Math.min(a.height, b.height)

  return width * height / (b.width * b.height)
}

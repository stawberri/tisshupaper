export function generatePostTitle(post) {
  let title = ''

  const artists = format(post.tag_string_artist)
  const copyrights = format(post.tag_string_copyright)
  const characters = format(post.tag_string_character, tag =>
    tag.replace(/\([^)]*\)/g, '')
  )

  if (!characters) {
    title = copyrights
  } else {
    title = characters
    if (copyrights) title += ` (${copyrights})`
  }

  if (artists) title += ` drawn by ${artists}`
  return title.trim()

  function format(tagString, process) {
    const dup = []
    const list = tagString
      .split(' ')
      .map(tag => {
        tag = tag.replace(/_/g, ' ')
        if (process) tag = process(tag)
        return tag
      })
      .filter(tag => {
        if (~dup.indexOf(tag)) return false
        return dup.push(tag)
      })

    switch (list.length) {
      case 0:
        return ''
      case 1:
        return list[0]
      case 2:
        return `${list[0]} and ${list[1]}`
      default:
        if (list.length > 5) {
          const visible = list.slice(0, 5)
          return `${visible.join(', ')}, and others`
        } else {
          const last = list.pop()
          return `${list.join(', ')}, and ${last}`
        }
    }
  }
}

export function postImageEstimation(width, height) {
  if (width <= 150 && height <= 150) return 0
  else if (width <= 850) return 1
  else return 2

  /*
  random size sampling
  preview: 150x96 119x150 106x150
  large: 850x544 850x1074 850x1200
  */
}

export function postImageCoverage(post, width, height, ignoreSize) {
  if (!post) return 0

  const { image_width: postWidth, image_height: postHeight } = post

  const area = width * height
  const ratio = postWidth / postHeight

  const shrinkWidth = Math.round(height * ratio)
  const shrinkHeight = Math.round(width / ratio)

  let postArea
  if (!ignoreSize && postHeight <= height && postWidth <= width) {
    postArea = postWidth * postHeight
  } else if (shrinkWidth <= width) {
    postArea = shrinkWidth * height
  } else {
    postArea = width * shrinkHeight
  }

  return postArea / area
}

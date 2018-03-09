export function generatePostTitle(post) {
  let title = ''

  const characters = format(post.tag_string_character)
  const copyrights = format(post.tag_string_copyright)
  const artists = format(post.tag_string_artist)

  if (!characters) {
    if (!copyrights) {
      title = 'drawn'
    } else {
      title = copyrights
    }
  } else {
    title = characters

    if (copyrights) {
      title += ` (${copyrights})`
    }
  }

  if (artists) {
    title += ` by ${artists}`
  }

  return title

  function format(tagString) {
    const list = tagString.split(' ')

    switch (list.length) {
      case 0:
        return
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

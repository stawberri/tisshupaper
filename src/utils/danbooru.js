import Danbooru from 'danbooru'
import chroma from 'chroma-js'

export function generatePostTitle(post) {
  let title = ''

  const artists = readTagString(post.tag_string_artist)
  const copyrights = readTagString(post.tag_string_copyright)
  const characters = readTagString(post.tag_string_character, tag =>
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
}

export function readTagString(tagString, process) {
  const dup = []
  const list = tagString
    .split(' ')
    .map(tag => {
      tag = tag.replace(/_/g, ' ')
      if (process) tag = process(tag)
      tag = tag.trim()
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

export function postSize(width, height) {
  const { devicePixelRatio = 1 } = window

  width *= devicePixelRatio
  height *= devicePixelRatio

  if (width <= 150 && height <= 150) return 0
  else if (width <= 850) return 1
  else return 2

  /*
  random size sampling
  preview: 150x96 119x150 106x150
  large: 850x544 850x1074 850x1200
  */
}

export function postColor(post) {
  const tagWords = post.tag_string_general.replace(/_/g, ' ').split(' ')

  const colors = []
  for (const word of tagWords) {
    try {
      colors.push(chroma(word))
    } catch (error) {}
  }

  if (colors.length) return chroma.average(colors)
  else return chroma(parseInt(post.md5, 16) % 0xffffff)
}

export function isValidImage(post) {
  if (post.file_ext === 'zip') return false

  return true
}

export function postSourceURL({ pixiv_id, source }) {
  if (pixiv_id) {
    return `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${pixiv_id}`
  } else {
    return source
  }
}

export function getDanbooruInstance(key) {
  if (!getDanbooruInstance.data) getDanbooruInstance.data = new WeakMap()

  if (!getDanbooruInstance.data.has(key)) {
    const [url] = key
    const value = new Danbooru(url)
    getDanbooruInstance.data.set(key, value)
  }

  return getDanbooruInstance.data.get(key)
}

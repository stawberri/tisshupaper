import { merge } from './posts'
import { getDanbooruInstance } from '../../utils/danbooru'

const actions = {
  set: 'splash.set'
}

export default actions

export function set(posts) {
  return {
    type: actions.set,
    payload: { posts }
  }
}

export function fetch(limit) {
  return async (dispatch, getState) => {
    const { config: { danbooru: booru, splashTags: tags } } = getState()
    const danbooru = getDanbooruInstance(booru)
    const posts = await danbooru.posts({ tags, limit })

    dispatch(merge(posts))
    dispatch(set(posts))
  }
}

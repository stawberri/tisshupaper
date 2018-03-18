import { merge as postMerge } from './posts'
import { merge as discoverMerge } from './discover'
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

    dispatch(postMerge(posts))
    dispatch(set(posts))
    dispatch(discoverMerge(posts))
  }
}

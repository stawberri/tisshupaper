import { merge } from './posts'

const actions = {
  set: 'splash.set'
}

export default actions

export function set(ids) {
  return {
    type: actions.set,
    payload: { ids }
  }
}

export function fetch() {
  return async (dispatch, getState) => {
    const { config: { danbooru, splashTags: tags } } = getState()

    const posts = await danbooru.posts({ tags })
    dispatch(merge(posts))
    dispatch(set(posts.map(({ id }) => id)))
  }
}
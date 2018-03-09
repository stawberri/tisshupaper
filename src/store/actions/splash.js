import { put as putPost } from './posts'

const actions = {
  add: 'splash.add',
  remove: 'splash.remove'
}

export default actions

export function add(id) {
  return {
    type: actions.add,
    payload: { id }
  }
}

export function remove(id) {
  return {
    type: actions.remove,
    payload: { id }
  }
}

export function fetch() {
  return async (dispatch, getState) => {
    const { config: { danbooru, splashTags: tags } } = getState()

    const posts = await danbooru.posts({ tags })
    for (const post of posts) {
      dispatch(putPost(post))
      dispatch(add(post.id))
    }
  }
}

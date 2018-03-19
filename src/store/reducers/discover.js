import actions from '../actions/discover'
import { isValidImage } from '../../utils/danbooru'

const init = { posts: {} }

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.merge: {
      const posts = { ...state.posts }
      for (const post of payload.posts) {
        if (isValidImage(post)) posts[post.id] = true
      }
      return { ...state, posts }
    }

    case actions.remove: {
      const posts = { ...state.posts }
      for (const id of payload.ids) delete posts[id]
      return { ...state, posts }
    }

    default:
      return state
  }
}

import actions from '../actions/discover'
import { isValidImage } from '../../utils/danbooru'

const init = { posts: {} }

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.merge: {
      const { posts } = payload
      const newState = { ...state }
      for (const post of posts) {
        if (isValidImage(post)) newState[post.id] = true
      }
      return newState
    }

    case actions.remove: {
      const { ids } = payload
      const newState = { ...state }
      for (const id of ids) delete newState[id]
      return newState
    }

    default:
      return state
  }
}

import actions from '../actions/splash'
import { isValidImage } from '../../utils/danbooru'

const init = {
  posts: []
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.set: {
      const posts = []
      for (const post of payload.posts)
        if (isValidImage(post)) posts.push(post.id)
      return { ...state, posts }
    }

    default:
      return state
  }
}

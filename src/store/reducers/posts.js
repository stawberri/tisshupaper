import actions from '../actions/posts'

const init = {
  data: {}
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.merge:
      const { posts } = payload
      const data = { ...state.data }
      for (const post of posts) data[post.id] = { ...post }
      return { ...state, data }

    default:
      return state
  }
}

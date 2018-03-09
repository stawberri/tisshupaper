import actions from '../actions/splash'

const init = {
  posts: {}
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.add:
      return { ...state, posts: { ...state.posts, [payload.id]: true } }

    case actions.remove:
      const { [payload.id]: removed, ...posts } = state
      return { ...state, posts }

    default:
      return state
  }
}

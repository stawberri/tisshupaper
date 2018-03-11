import actions from 'store/actions/splash'

const init = {
  posts: []
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.set:
      return { ...state, posts: [...payload.ids] }

    default:
      return state
  }
}

import actions from '../actions/posts'

const init = {
  data: {}
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.put:
      const { post } = payload
      return { ...state, data: { ...state.data, [post.id]: post } }

    case actions.remove:
      const { [payload.id]: removed, ...data } = state.data
      return { ...state, data }

    default:
      return state
  }
}

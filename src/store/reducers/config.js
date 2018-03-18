import actions from '../actions/config'

const init = {
  danbooru: [],
  splashTags: 'order:rank rating:safe'
}

export default function(state = init, { type, payload }) {
  switch (type) {
    case actions.set:
      const { key, value } = payload
      if (key in state) return { ...state, [key]: value }
      else return state

    default:
      return state
  }
}

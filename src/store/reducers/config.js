import actions from 'store/actions/config'
import Danbooru from 'danbooru'

const init = {
  danbooru: new Danbooru(),
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

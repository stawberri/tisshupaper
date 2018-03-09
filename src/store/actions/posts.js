const actions = {
  merge: 'posts.merge'
}

export default actions

export function merge(posts) {
  return {
    type: actions.merge,
    payload: { posts }
  }
}

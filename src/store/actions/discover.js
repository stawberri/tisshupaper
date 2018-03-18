const actions = {
  merge: 'discover.merge',
  remove: 'discover.remove'
}

export default actions

export function merge(posts) {
  return {
    type: actions.merge,
    payload: { posts }
  }
}

export function remove(ids) {
  return {
    type: actions.remove,
    payload: { ids }
  }
}

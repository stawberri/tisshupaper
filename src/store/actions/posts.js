const actions = {
  put: 'posts.put',
  remove: 'posts.remove'
}

export default actions

export function put(post) {
  return {
    type: actions.put,
    payload: { post }
  }
}

export function remove(id) {
  return {
    type: actions.remove,
    payload: { id }
  }
}

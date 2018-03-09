const actions = {
  set: 'config.set'
}

export default actions

export function set(key, value) {
  return {
    type: actions.set,
    payload: { key, value }
  }
}

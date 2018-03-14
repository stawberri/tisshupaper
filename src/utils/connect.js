import { connect } from 'react-redux'

export default function impureConnect(...args) {
  args[3] = { pure: false, ...(args[3] || {}) }
  return connect(...args)
}

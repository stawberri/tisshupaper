import { fetch } from '../actions/splash'

export default function({ getState }) {
  return next => {
    setInterval(() => next(fetch(200)), 300000)
    next(fetch(200))

    return action => {
      return next(action)
    }
  }
}

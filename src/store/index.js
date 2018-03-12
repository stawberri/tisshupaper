import { createStore, combineReducers, applyMiddleware } from 'redux'
import * as reducers from './reducers'

import danbooru from './middleware/danbooru'
import thunk from 'redux-thunk'

const reducer = combineReducers(reducers)
const middleware = applyMiddleware(danbooru, thunk)

const store = createStore(reducer, middleware)
export default store

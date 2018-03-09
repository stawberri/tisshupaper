import { createStore, combineReducers, applyMiddleware } from 'redux'
import * as reducers from './reducers'
import thunk from 'redux-thunk'

const reducer = combineReducers(reducers)
const middleware = applyMiddleware(thunk)

const store = createStore(reducer, middleware)
export default store

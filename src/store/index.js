import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import stone_app from '@/__reactnative_stone/store/app'
import stone_auth from '@/__reactnative_stone/store/auth'
import data from './data'

const rootReducer = combineReducers({
  stone_app,
  stone_auth,
  data
})

const store = createStore(rootReducer, applyMiddleware(thunk))

export default store

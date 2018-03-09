import React from 'react'
import store from '../store'

import { Provider } from 'react-redux'
import Splash from './splash'

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Splash />
      </Provider>
    )
  }
}

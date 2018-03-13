import React from 'react'
import store from 'store'

import { Provider } from 'react-redux'
import Splash from './splash'
import { TisshupaperScreen } from './tisshupaper'

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <React.Fragment>
          <Splash />
          <TisshupaperScreen />
        </React.Fragment>
      </Provider>
    )
  }
}

import React from 'react'
import store from '../store'
import theme from '../utils/theme'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import Splash from './splash'
import { TisshupaperScreen } from './tisshupaper'

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <React.Fragment>
              <Switch>
                <Route component={Splash} />
              </Switch>
              <TisshupaperScreen />
            </React.Fragment>
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    )
  }
}

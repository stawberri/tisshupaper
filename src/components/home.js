import React from 'react'
import styled from 'styled-components'

import Header from './header'

const Wrapper = styled.main``

export default class Home extends React.Component {
  render() {
    return (
      <Wrapper>
        <Header to="/">Tisshupaper</Header>
      </Wrapper>
    )
  }
}

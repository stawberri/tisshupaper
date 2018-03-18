import React from 'react'
import styled from 'styled-components'

import Header from './header'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
`

export default class Discover extends React.Component {
  render() {
    return (
      <Wrapper>
        <Header to="/home">Discover</Header>
      </Wrapper>
    )
  }
}

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { getDanbooruInstance } from '../utils/danbooru'

import Header from './header'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
`

class Discover extends React.Component {
  render() {
    return (
      <Wrapper>
        <Header to="/home">Discover</Header>
      </Wrapper>
    )
  }
}

export default connect(({ config: { danbooru } }) => ({
  danbooru: getDanbooruInstance(danbooru)
}))(Discover)

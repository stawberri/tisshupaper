import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'

const Wrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: flex-end;

  margin-bottom: 1rem;
`

const Item = styled(Link)`
  padding: 1em;
  margin: 0 1em;
`

const MainItem = Item.extend``

export default class Menubar extends React.Component {
  render() {
    return (
      <Wrapper>
        <Item to="/stash">Stash</Item>
        <MainItem to="/discover">Discover</MainItem>
        <Item to="/settings">Settings</Item>
      </Wrapper>
    )
  }
}

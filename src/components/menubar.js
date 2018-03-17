import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 1rem;

  font-size: 5vw;

  @media (min-width: 30em) {
    font-size: 1.5em;
  }
`

const Item = styled(Link)`
  padding: 0.25em;
  margin: 0 0.69em;

  color: inherit;
  border-radius: 5em;
`

const MainItem = Item.extend`
  font-size: 1.1em;

  color: ${({ theme }) => theme.bg};
  background: ${({ theme }) => theme.darkText};
  padding: 0.3em 2.5em;
`

export default class Menubar extends React.Component {
  render() {
    return (
      <Wrapper>
        <Item to="/stash">
          <FontAwesome icon="heart" />
        </Item>
        <MainItem to="/discover">
          <FontAwesome icon="search" />
        </MainItem>
        <Item to="/settings">
          <FontAwesome icon="cog" />
        </Item>
      </Wrapper>
    )
  }
}

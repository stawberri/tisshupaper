import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 1em 0;
  margin-bottom: max(1em, env(safe-area-inset-bottom));

  font-size: 5vw;

  @media (min-width: 30em) {
    font-size: 1.5em;
  }

  @media (max-width: 300px) {
    font-size: 15px;
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
  background: ${({ theme }) => theme.text};
  padding: 0.3em 2.5em;
`

export default class Menubar extends React.Component {
  render() {
    return (
      <Wrapper>
        <Item to="/stash" style={{ opacity: 0.5 }}>
          <FontAwesome icon="heart" />
        </Item>
        <MainItem to="/discover">
          <FontAwesome icon="search" />
        </MainItem>
        <Item to="/settings" style={{ opacity: 0.5 }}>
          <FontAwesome icon="cog" />
        </Item>
      </Wrapper>
    )
  }
}

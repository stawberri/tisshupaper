import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  height: 2em;
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  font-size: 2rem;

  ${({ noBorder, theme }) =>
    noBorder || `border-bottom: 1px solid ${theme.highlight}`};

  @media (max-width: 30rem) {
    font-size: 1.5rem;
  }
`

const Mid = styled.div`
  grid-column: 2 / 3;
  justify-self: center;

  font-weight: 500;
`

const Left = styled(Link)`
  grid-column: 1 / 2;
  justify-self: start;

  padding: 0 0.7em;

  font-size: 0.8em;

  color: inherit;
  text-decoration: none;
`

const Right = styled.div`
  grid-column: 3 / 4;
  justify-self: end;
`

export default class Header extends React.Component {
  render() {
    const { children, to, className, noBorder } = this.props

    return (
      <Wrapper className={className} noBorder={noBorder}>
        {false && <Right />}
        {to && (
          <Left to={to}>
            <FontAwesome icon="chevron-left" />
          </Left>
        )}
        <Mid children={children} />
      </Wrapper>
    )
  }

  static defaultProps = {
    label: 'Back'
  }
}

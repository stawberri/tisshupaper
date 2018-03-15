import React from 'react'
import styled from 'styled-components'

import { spring, Motion } from 'react-motion'

let registrations = 0
let registrationListener

const Screen = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding-bottom: 10vh;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${({ theme }) => theme.fg};
  font-size: 10vw;
  background: ${({ theme }) => theme.bg};

  @media (min-width: 1000px) {
    font-size: 100px;
  }

  &::before {
    content: 'Tisshupaper';
  }
`

export class TisshupaperScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = { registrations: 1 }
  }

  componentDidMount() {
    if (registrationListener) {
      throw new Error('Multiple tisshupaper screen components')
    }

    registrationListener = this.registered
    this.setState({ registrations })
  }

  componentWillUnmount() {
    registrationListener = null
  }

  registered = registrations => {
    this.setState({ registrations })
  }

  renderMotion({ opacity }) {
    if (!opacity) return null

    let style
    if (opacity < 1) {
      style = {
        opacity,
        pointerEvents: 'none',
        transform: 'translateZ(0)'
      }
    }

    return <Screen style={style} />
  }

  render() {
    const { registrations } = this.state
    const style = {
      opacity: spring(+!!(registrations > 0), { stiffness: 90, damping: 20 })
    }

    return <Motion style={style}>{this.renderMotion}</Motion>
  }
}

function register(num) {
  registrations += num
  if (registrationListener) registrationListener(registrations)
}

export default class RegisterTisshupaper extends React.Component {
  constructor(props) {
    super(props)
    register(props.holds)
  }

  componentWillReceiveProps(props) {
    const difference = props.holds - this.props.holds
    if (difference) register(difference)
  }

  componentWillUnmount() {
    register(-this.props.holds)
  }

  render() {
    const { children = null } = this.props
    return children
  }

  static defaultProps = { holds: 1 }
}

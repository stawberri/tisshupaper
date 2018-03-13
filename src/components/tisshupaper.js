import React from 'react'
import styled from 'styled-components'
import chroma from 'chroma-js'

import { spring, Motion } from 'react-motion'

let registrations = 0
let registrationListener

const Wrapper = styled.div`
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

  color: #444;
  font-size: 10vw;

  @media (min-width: 1000px) {
    font-size: 100px;
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

  renderMotion({ opacity, bg }) {
    if (!opacity) return null
    const style = {
      opacity,
      background: chroma('white').alpha(bg),
      transform: `scale(${1 + 0.5 * (1 - opacity)})`
    }

    return <Wrapper style={style}>Tisshupaper</Wrapper>
  }

  render() {
    const { registrations } = this.state
    const style = {
      opacity: spring(+!!registrations, { stiffness: 100, damping: 20 }),
      bg: spring(+!!registrations, { stiffness: 200, damping: 25 })
    }

    return <Motion style={style}>{this.renderMotion}</Motion>
  }
}

export function register() {
  let unregistered

  registrations++
  if (registrationListener) registrationListener(registrations)

  return () => {
    if (unregistered) return
    unregistered = true

    registrations--
    if (registrationListener) registrationListener(registrations)
  }
}

export default class RegisterTisshupaper extends React.Component {
  componentDidMount() {
    this.unregister = register()
  }

  componentWillUnmount() {
    this.unregister()
  }

  render() {
    return null
  }
}

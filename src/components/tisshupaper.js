import React from 'react'
import styled from 'styled-components'

import { spring, Motion } from 'react-motion'

let registrations = 0
let registrationListener

const Screen = styled.aside`
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

  font-size: 10vw;
  font-weight: 200;
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

  render() {
    const { registrations } = this.state
    const style = {
      opacity: spring(+!!(registrations > 0), { stiffness: 90, damping: 20 })
    }

    return (
      <Motion style={style}>
        {({ opacity }) =>
          opacity ? (
            <Screen
              style={
                opacity < 1
                  ? {
                      opacity,
                      pointerEvents: 'none',
                      transform: 'translateZ(0)'
                    }
                  : undefined
              }
            />
          ) : null
        }
      </Motion>
    )
  }
}

function register(num) {
  if (!num) return
  registrations += num
  if (registrationListener) registrationListener(registrations)
}

export default class RegisterTisshupaper extends React.Component {
  componentDidMount() {
    register(this.props.holds)
  }

  componentDidUpdate(prevProps) {
    register(this.props.holds - prevProps.holds)
  }

  componentWillUnmount() {
    register(-this.props.holds)
  }

  render() {
    return this.props.children || null
  }

  static defaultProps = { holds: 1 }
}

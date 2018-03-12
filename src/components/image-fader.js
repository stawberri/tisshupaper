import React from 'react'
import asap from 'asap'

import { TransitionGroup, CSSTransition } from 'react-transition-group'

const dataMap = new WeakMap()

export default class ImageFader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      saved: []
    }
  }

  componentDidMount() {
    this.saveChildren()
  }

  componentWillReceiveProps(props) {
    if (props.children !== this.props.children) asap(() => this.saveChildren())
  }

  saveChildren() {
    const saved = this.state.saved.slice()
    const save = saved.shift()
    const child = React.Children.only(this.props.children)

    for (let i = saved.length - 1; i >= 0; i--) {
      if (!dataMap.get(saved[i]).loaded) saved.splice(i, 1)
    }

    let key
    let data
    if (save && save.props.id === child.props.id) {
      key = save.key
      data = dataMap.get(save)
    } else if (child) {
      if (save) saved.unshift(save)
      key = generateKey()
      data = {}
    }

    const clonedChild = React.cloneElement(child, {
      key: key,
      imageRef: this.childRef,
      onLoad: this.childLoaded
    })

    dataMap.set(clonedChild, data)
    saved.unshift(clonedChild)

    this.setState({ saved })
  }

  childRef = ref => {
    const save = this.state.saved[0]
    if (!save || !ref || save.props.id !== ref.props.id) return
    else if (ref) dataMap.get(save).ref = ref
  }

  childLoaded = ({ ref }) => {
    const saved = this.state.saved.slice()
    const index = saved.findIndex(save => dataMap.get(save).ref === ref)
    const save = saved[index]

    if (!save) return

    dataMap.get(save).loaded = true
    this.setState({ saved: saved.slice(0, index + 1) })
  }

  render() {
    const { saved } = this.state

    const {
      children,
      classNames,
      timeout,
      addEndListener,
      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited,
      ...props
    } = this.props

    const transitionProps = {
      classNames,
      timeout,
      addEndListener,
      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited
    }

    return (
      <TransitionGroup component={React.Fragment} {...props}>
        {saved.map(save => (
          <CSSTransition key={`${save.key} | transition`} {...transitionProps}>
            {save}
          </CSSTransition>
        ))}
      </TransitionGroup>
    )
  }
}

let lastKeyTime
let lastKeyNumber
function generateKey() {
  const now = Date.now()
  if (now !== lastKeyTime) {
    lastKeyTime = now
    lastKeyNumber = 0
  } else lastKeyNumber++

  return `image-fader key | ${lastKeyTime} | ${lastKeyNumber}`
}

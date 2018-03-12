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

    if (save && save.props.id === child.props.id) {
      const clonedChild = React.cloneElement(child, {
        key: save.key
      })

      dataMap.set(clonedChild, dataMap.get(save))
      saved.unshift(clonedChild)
    } else if (child) {
      const clonedChild = React.cloneElement(child, {
        key: generateKey(),
        ref: this.childRef,
        onLoad: this.childLoaded
      })

      dataMap.set(clonedChild, { onRef: child.props.ref })
      saved.unshift(clonedChild)
    }

    this.setState({ saved })
  }

  childRef = ref => {
    const saved = this.state.saved.slice()
    const save = saved[0]
    const saveData = dataMap.get(save)

    if (!save || !ref || save.props.id !== ref.props.id) return
    if (saveData.onRef) saveData.onRef.call(undefined, ref)

    if (ref) saveData.ref = ref
    else saved.shift()

    this.setState({ saved })
  }

  childLoaded = ({ ref }) => {
    const save = this.state.saved.find(save => dataMap.get(save).ref === ref)
    if (save) dataMap.get(save).loaded = true
  }

  render() {
    const { saved } = this.state

    console.log(saved)

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

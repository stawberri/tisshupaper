import React from 'react'
import asap from 'asap'
import { uniqueKey } from '../utils'

import { spring, TransitionMotion } from 'react-motion'

export default class ImageFader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      images: []
    }
  }

  componentDidMount() {
    this.saveChild()
  }

  componentWillReceiveProps(props) {
    if (props.children !== this.props.children) asap(() => this.saveChild())
  }

  saveChild() {
    const images = this.state.images.slice()
    const currentImage = images.shift() || {}
    const element = React.Children.only(this.props.children)

    let image
    const { id } = element.props
    if (element === currentImage.element) return
    else if (id === currentImage.id) image = currentImage
    else {
      if (currentImage.loaded) images.unshift(currentImage)
      image = { key: uniqueKey(), id }
    }

    images.unshift({ ...image, element })
    this.setState({ images })
  }

  childLoaded = async event => {
    let image = this.state.images[0]
    if (!image || image.id !== event.id) return

    if (!image.loaded) {
      const update = { ...image, loaded: true }
      await new Promise(done => this.setState({ images: [update] }, done))
    }

    if (this.props.onLoad) this.props.onLoad(event)
  }

  childEnter() {
    return { opacity: 0, brightness: 2 }
  }

  childLeave({ data: { loaded } }) {
    return loaded
      ? {
          opacity: spring(0),
          brightness: spring(3, { stiffness: 250, damping: 40 })
        }
      : null
  }

  renderTransition = styles => {
    const children = styles.map(({ key, data, style }) => {
      const props = {
        key,
        onLoad: this.childLoaded,
        style: {
          opacity: style.opacity,
          filter: `brightness(${style.brightness})`
        }
      }

      if (style.opacity !== 1 || style.brightness !== 1)
        style.transform = 'translateZ(0)'

      if (data.element.props.style)
        props.style = { ...props.style, ...data.element.props.style }

      return React.cloneElement(data.element, props)
    })

    return <React.Fragment>{children}</React.Fragment>
  }

  render() {
    const { images } = this.state

    const styles = images.map(({ key, element, loaded }) => ({
      key,
      data: { element, loaded },
      style: { opacity: spring(+!!loaded), brightness: spring(1 + !loaded) }
    }))

    return (
      <TransitionMotion
        styles={styles}
        willEnter={this.childEnter}
        willLeave={this.childLeave}
      >
        {this.renderTransition}
      </TransitionMotion>
    )
  }
}

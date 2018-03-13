import React from 'react'
import asap from 'asap'

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
      image = { key: generateKey(), id }
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

  childLeave() {
    return {
      opacity: spring(0),
      brightness: spring(3, { stiffness: 250, damping: 40 })
    }
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
        {styles => (
          <React.Fragment>
            {styles.map(({ key, data, style }) =>
              React.cloneElement(data.element, {
                key,
                onLoad: this.childLoaded,
                style: {
                  opacity: style.opacity,
                  filter: `brightness(${style.brightness})`
                }
              })
            )}
          </React.Fragment>
        )}
      </TransitionMotion>
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

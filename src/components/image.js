import React from 'react'
import { connect } from 'react-redux'
import styled, { keyframes, css } from 'styled-components'
import { resize } from 'utils/image'
import { postSize, postColor } from 'utils/danbooru'
import resized from 'utils/resized'
import transparent from 'img/transparent.gif'
import asap from 'asap'
import uniqueKey from 'utils/unique-key'

import { spring, TransitionMotion } from 'react-motion'

const Wrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
`

const scrollBg = keyframes`
  to {
    background-position: 0 4rem;
  }
`

const Picture = styled.img`
  position: absolute;
  flex: none;

  ${({ postSize }) =>
    ~postSize ||
    css`
      background: 0 0 / 2rem 2rem;
      animation: ${scrollBg} 1s linear infinite;
    `}};
`

class Image extends React.Component {
  constructor(props) {
    super(props)

    this.preloaders = Array.from(new Array(3), () =>
      document.createElement('img')
    )

    this.state = {
      loaded: [],
      width: 0,
      height: 0,
      key: uniqueKey()
    }
  }

  componentDidMount() {
    this.preloaders.forEach(img =>
      img.addEventListener('load', this.preloaderLoaded)
    )
  }

  componentWillReceiveProps(props) {
    let oldProps = this.props
    const { post, size } = props

    if (oldProps.post.id !== post.id) asap(() => this.beginPreload(true))
    else if (oldProps.size !== size) asap(() => this.beginPreload())
  }

  componentWillUnmount() {
    this.preloaders.forEach(img =>
      img.removeEventListener('load', this.preloaderLoaded)
    )
  }

  async beginPreload(newPost) {
    const { preloaders } = this
    const { post, danbooru } = this.props

    if (!post) return

    const target = this.getTarget()
    if (newPost) {
      await new Promise(done =>
        this.setState({ loaded: [], key: uniqueKey() }, done)
      )
    } else if (this.state.loaded[target]) return

    const { loaded } = this.state
    const imgOk = loaded[2]
    const largeOk = imgOk || loaded[1]
    const previewOk = largeOk || loaded[0]

    if (!previewOk) {
      preloaders[0].src = danbooru.url(post.preview_file_url)
    }

    if (!largeOk && target >= 1) {
      preloaders[1].src = danbooru.url(post.large_file_url)
    }

    if (!imgOk && target >= 2) {
      preloaders[2].src = danbooru.url(post.file_url)
    }
  }

  preloaderLoaded = async event => {
    const target = this.getTarget()
    let { loaded } = this.state
    const { onLoad, post } = this.props
    const { preloaders } = this

    const size = preloaders.findIndex(preloader => event.target === preloader)
    if (!~size) return

    if (!loaded[size]) {
      loaded = loaded.slice()
      loaded[size] = true
      await new Promise(done => this.setState({ loaded }, done))
    }

    if (onLoad)
      onLoad({
        ref: this,
        id: post.id,
        size,
        target
      })
  }

  wrapperRef = ref => {
    if (this.unobserveWrapper) this.unobserveWrapper()
    if (ref) {
      this.unobserveWrapper = resized(ref, entry => {
        const { width, height } = entry.contentRect
        this.setSize(width, height)
      })

      let { clientWidth: width, clientHeight: height } = ref
      const style = getComputedStyle(ref)

      width -= parseInt(style.paddingLeft, 10)
      width -= parseInt(style.paddingRight, 10)
      height -= parseInt(style.paddingTop, 10)
      height -= parseInt(style.paddingBottom, 10)

      this.setSize(width, height)
    } else {
      this.setSize(0, 0)
    }
  }

  async setSize(width, height) {
    await new Promise(done => this.setState({ width, height }, done))
    if (width || height) this.beginPreload()
  }

  getSize() {
    const { post, cover, scale } = this.props
    const { width: containerWidth, height: containerHeight } = this.state

    if (!containerWidth || !containerHeight) return { width: 69, height: 69 }
    if (!post) return { width: containerWidth, height: containerHeight }

    const { image_width, image_height } = post

    let width, height
    ;({ width, height } = resize(
      { width: image_width, height: image_height },
      { width: containerWidth, height: containerHeight },
      cover
    ))

    if (
      (scale === 'down' && width > image_width) ||
      (scale === 'up' && width < image_width)
    ) {
      width = image_width
      height = image_height
    }

    return { width, height }
  }

  getTarget() {
    const { size } = this.props
    if (typeof size === 'number') return size
    else return postSize(this.getSize(this.props))
  }

  transitionLeave() {
    return { opacity: spring(0, { stiffness: 200, damping: 30 }) }
  }

  renderTransition = styles => {
    const children = styles.reverse().map(({ key, data, style }) => {
      const { post, src, size } = data
      const { opacity } = style
      const sizes = this.getSize()

      const css = { ...sizes, opacity }
      if (opacity !== 1) css.transform = 'translate3d(0, 0, 0)'

      if (size === -1) {
        const color = postColor(post)
        const color1 = color.brighten(1)
        const color2 = color.brighten(1.2)
        css.backgroundImage = `
        repeating-linear-gradient(
          45deg,
          ${color1} 25%, ${color2} 25%,
          ${color2} 50%, ${color1} 50%,
          ${color1} 75%, ${color2} 75%
        )
        `
      }

      return <Picture key={key} src={src} style={css} postSize={size} />
    })

    return <React.Fragment>{children}</React.Fragment>
  }

  render() {
    const { loaded, key } = this.state
    const { className, post, danbooru, style: css } = this.props
    const { preview_file_url, large_file_url, file_url } = post || {}

    const target = this.getTarget()

    const styles = []
    if (post) {
      const style = {
        data: { post },
        style: { opacity: spring(1) }
      }

      if (target >= 2 && loaded[2]) {
        style.data.size = 2
        style.data.src = danbooru.url(file_url)
      } else if (target >= 1 && loaded[1]) {
        style.data.size = 1
        style.data.src = danbooru.url(large_file_url)
      } else if (loaded[0]) {
        style.data.size = 0
        style.data.src = danbooru.url(preview_file_url)
      } else {
        style.data.size = -1
        style.data.src = transparent
      }

      style.key = `${key} | ${style.data.size}`
      styles.push(style)
    }

    return (
      <Wrapper className={className} style={css} innerRef={this.wrapperRef}>
        {post && (
          <TransitionMotion styles={styles} willLeave={this.transitionLeave}>
            {this.renderTransition}
          </TransitionMotion>
        )}
      </Wrapper>
    )
  }
}

export default connect(({ posts: { data }, config: { danbooru } }, { id }) => ({
  post: data[id],
  danbooru
}))(Image)

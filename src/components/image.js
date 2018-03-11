import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { resize } from 'utils/image'
import { postImageEstimation } from 'utils/danbooru'
import ResizeObserver from 'resize-observer-polyfill'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
`

const Picture = styled.img`
  width: ${({ sizeData: { width } }) => width}px;
  height: ${({ sizeData: { height } }) => height}px;

  object-fit: contain;
`

class Image extends React.Component {
  constructor(props) {
    super(props)

    this.resizeObserver = new ResizeObserver(this.resizeObserved)

    this.preloaders = Array.from(new Array(3), () =>
      document.createElement('img')
    )

    this.state = {
      target: 0,
      loaded: [],
      width: 0,
      height: 0
    }
  }

  componentDidMount() {
    this.preloaders.forEach(img =>
      img.addEventListener('load', this.preloaderLoaded)
    )
  }

  componentWillReceiveProps(props) {
    let oldProps = this.props
    const { post } = props

    if (post && oldProps.post !== post) this.beginPreload(post)
  }

  componentWillUnmount() {
    this.preloaders.forEach(img =>
      img.removeEventListener('load', this.preloaderLoaded)
    )

    this.resizeObserver.disconnect()
  }

  async beginPreload(override) {
    if (!override && !this.props.post) return

    const target = postImageEstimation(this.getSize())
    if (!override) {
      if (this.state.target === target) return
      else if (this.state.loaded[target]) return this.setState({ target })
    }

    const { onLoadStart } = this.props
    if (onLoadStart) onLoadStart()

    await new Promise(done => this.setState({ target, loaded: [] }, done))

    const { preloaders } = this
    const { post, danbooru } = this.props

    preloaders[0].src = danbooru.url(post.preview_file_url)
    if (target >= 1) preloaders[1].src = danbooru.url(post.large_file_url)
    if (target >= 2) preloaders[2].src = danbooru.url(post.file_url)
  }

  preloaderLoaded = async event => {
    const { preloaders } = this

    for (let i = 0; i < preloaders.length; i++) {
      if (event.target !== preloaders[i]) continue

      let { loaded } = this.state
      if (!loaded[i]) {
        loaded = loaded.slice()
        loaded[i] = true
        await new Promise(done => this.setState({ loaded }, done))
      }

      const { target } = this.state
      const { onLoad } = this.props
      if (target === i && onLoad) onLoad()

      return
    }
  }

  getSize() {
    const { post, cover, scale } = this.props
    const { width: containerWidth, height: containerHeight } = this.state

    if (!post) return { width: 0, height: 0 }
    if (!containerWidth || !containerHeight) return { width: 0, height: 0 }

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

  wrapperRef = ref => {
    const { resizeObserver } = this

    if (this.wrapper) resizeObserver.unobserve(this.wrapper)
    this.wrapper = ref

    if (ref) {
      resizeObserver.observe(ref)

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

  resizeObserved = entries => {
    const entry = entries.find(({ target }) => target === this.wrapper)
    const { width, height } = entry.contentRect
    this.setSize(width, height)
  }

  setSize = async (width, height) => {
    await new Promise(done => this.setState({ width, height }, done))
    ;({ width, height } = this.state)

    if (width || height) this.beginPreload()
  }

  render() {
    const { target, loaded } = this.state
    const { className, post, danbooru } = this.props

    let src
    if (!post) src = null
    else if (target >= 2 && loaded[2]) src = danbooru.url(post.file_url)
    else if (target >= 1 && loaded[1]) src = danbooru.url(post.large_file_url)
    else src = danbooru.url(post.preview_file_url)

    const sizeData = this.getSize()
    const validSize = sizeData.width > 0 && sizeData.height > 0

    return (
      <Wrapper className={className} innerRef={this.wrapperRef}>
        {post && validSize && <Picture src={src} sizeData={sizeData} />}
      </Wrapper>
    )
  }
}

export default connect(({ posts: { data }, config: { danbooru } }, { id }) => ({
  post: data[id],
  danbooru
}))(Image)

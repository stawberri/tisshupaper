import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { resize } from 'utils/image'
import { postSize, postColor } from 'utils/danbooru'
import resized from 'utils/resized'
import transparent from 'img/transparent.gif'
import asap from 'asap'

const Wrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
`

const Picture = styled.img`
  flex: none;
  object-fit: contain;
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
    const { post, size } = props

    if (oldProps.post !== post) asap(() => this.beginPreload(true))
    else if (oldProps.size !== size) asap(() => this.beginPreload())
  }

  componentWillUnmount() {
    this.preloaders.forEach(img =>
      img.removeEventListener('load', this.preloaderLoaded)
    )
  }

  async beginPreload(newPost) {
    const { preloaders } = this
    const { onLoadStart, post, danbooru } = this.props

    const target = this.getTarget()
    if (!post || (!newPost && this.state.loaded[target])) return

    if (onLoadStart) onLoadStart()

    await new Promise(done => this.setState({ loaded: [] }, done))

    preloaders[0].src = danbooru.url(post.preview_file_url)
    if (target >= 1) preloaders[1].src = danbooru.url(post.large_file_url)
    if (target >= 2) preloaders[2].src = danbooru.url(post.file_url)
  }

  preloaderLoaded = async event => {
    const target = this.getTarget()
    let { loaded } = this.state
    const { onLoad, onLoadPreview } = this.props
    const { preloaders } = this

    const index = preloaders.findIndex(preloader => event.target === preloader)
    if (!~index) return

    if (!loaded[index]) {
      loaded = loaded.slice()
      loaded[index] = true
      await new Promise(done => this.setState({ loaded }, done))
    }

    if (!index && onLoadPreview) onLoadPreview()
    if (target === index && onLoad) onLoad()
  }

  wrapperRef = ref => {
    if (this.unobserve) this.unobserve()
    if (ref) {
      this.unobserve = resized(ref, this.resizeObserved)

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

  resizeObserved = entry => {
    const { width, height } = entry.contentRect
    this.setSize(width, height)
  }

  setSize = async (width, height) => {
    width = Math.round(width)
    height = Math.round(height)

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
    return this.props.size || postSize(this.getSize(this.props))
  }

  render() {
    const { loaded } = this.state
    const { className, post, danbooru } = this.props
    const { preview_file_url, large_file_url, file_url } = post || {}

    const style = this.getSize()
    const target = this.getTarget()

    let src = transparent
    if (post) {
      if (target >= 2 && loaded[2]) src = danbooru.url(file_url)
      else if (target >= 1 && loaded[1]) src = danbooru.url(large_file_url)
      else if (loaded[0]) src = danbooru.url(preview_file_url)
      else style.background = postColor(post)
    }

    return (
      <Wrapper className={className} innerRef={this.wrapperRef}>
        <Picture src={src} style={style} />
      </Wrapper>
    )
  }
}

export default connect(({ posts: { data }, config: { danbooru } }, { id }) => ({
  post: data[id],
  danbooru
}))(Image)

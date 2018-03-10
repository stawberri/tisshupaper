import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { fetch } from 'store/actions/splash'

import { generatePostTitle, postImageCoverage } from 'utils/danbooru'

const blurStrength = 'calc((5vw + 5vh) / 2)'
const insetLeft = 'max(2rem, env(safe-area-inset-left))'
const insetRight = 'max(2rem, env(safe-area-inset-right))'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;

  height: 100%;
  box-sizing: border-box;

  display: flex;
  flex-flow: column nowrap;
`

const BackgroundImage = styled.img`
  position: fixed;
  top: calc(-2 * ${blurStrength});
  left: calc(-2 * ${blurStrength});
  width: calc(4 * ${blurStrength} + 100vw);
  height: calc(4 * ${blurStrength} + 100vh);

  object-fit: cover;

  filter: blur(${blurStrength});

  z-index: -1;
  pointer-events: none;
`

const MainImage = styled.img`
  flex: auto;
  min-height: 0;

  margin: 1rem 2rem 0;
  margin-top: max(1rem, env(safe-area-inset-top));
  margin-left: ${insetLeft};
  margin-right: ${insetRight};

  object-fit: ${({ isLoading }) => (isLoading ? 'contain' : 'scale-down')};
  ${({ isLoading }) => isLoading && `filter: blur(calc((0.5vw + 0.5vh) / 2))`};
`

const Meta = styled.p`
  align-self: center;
  height: 2rem;
  padding: 0.1rem 1rem;
  margin: 0.69rem 0 0;
  overflow: hidden;

  padding-bottom: max(0.1rem, env(safe-area-inset-bottom));
  max-width: calc(100% - 4rem);
  max-width: calc(100% - ${insetLeft} - ${insetRight});

  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;

  background: white;

  white-space: nowrap;
`

const transparent =
  'data:image/gif;base64,R0lGODlhAQABAIAAA' +
  'AAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      imageWidth: 0,
      imageHeight: 0,
      loading: true,
      pickedPost: null
    }
  }

  componentDidMount() {
    this.preloadImg = document.createElement('img')
    this.preloadImg.addEventListener('load', this.preloadLoaded)

    this.randomizePost()

    const { dispatch } = this.props
    dispatch(fetch(1))
    dispatch(fetch(20))
    dispatch(fetch(200))

    window.addEventListener('resize', this.updateImageSize)
  }

  componentWillReceiveProps(props) {
    this.randomizePost(props)

    const { posts } = props
    if (posts.length >= 200) {
      this.pickPost()
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.updateImageAnimationFrame)
    window.removeEventListener('resize', this.updateImageSize)
    this.preloadImg.removeEventListener('load', this.preloadLoaded)
  }

  randomizePost({ data, posts } = this.props, force) {
    const post =
      this.state.pickedPost ||
      data[posts[Math.floor(Math.random() * posts.length)]]
    const id = (post && post.id) || true
    this.setState(({ loading }) => ({ loading: (force || loading) && id }))
  }

  saveImageRef = ref => {
    if (ref) this.mainImageRef = ref
    this.updateImageSize()
  }

  updateImageSize = () => {
    if (this.updateImageAnimationFrame) return
    this.updateImageAnimationFrame = requestAnimationFrame(() => {
      delete this.updateImageAnimationFrame

      const ref = this.mainImageRef
      if (!ref) return

      this.setState({
        imageWidth: ref.clientWidth,
        imageHeight: ref.clientHeight
      })

      this.pickPost()
    })
  }

  mainImageLoaded = () => {
    this.randomizePost()
  }

  preloadLoaded = () => {
    if (this.preloadId === this.state.pickedPost.id) {
      this.setState({ loading: false })
    }
  }

  pickPost() {
    const { imageWidth, imageHeight } = this.state
    const { data, posts, danbooru } = this.props
    if (!posts.length) return

    let pickedPost = null
    let pickedScore = -Infinity

    posts.forEach((id, index) => {
      let score = 0
      const post = data[id]

      const indexScore = 1 - index / 200
      score += indexScore * 3

      const coverageScore = postImageCoverage(post, imageWidth, imageHeight)
      score += coverageScore * 4

      const aspectScore = postImageCoverage(post, imageWidth, imageHeight, true)
      score += aspectScore * 2

      const randomScore = randAdjust(index)
      score += randomScore * 2

      if (score > pickedScore) {
        pickedScore = score
        pickedPost = post
      }
    })

    if (!this.state.pickedPost || this.state.pickedPost.id !== pickedPost.id) {
      this.randomizePost(undefined, true)
      this.setState({ pickedPost })
      this.preloadId = pickedPost.id
      this.preloadImg.src = danbooru.url(pickedPost.file_url)
    }
  }

  render() {
    const { loading, pickedPost } = this.state
    const { danbooru, data } = this.props

    const post = loading ? data[loading] : pickedPost
    const src = post
      ? danbooru.url(loading ? post.preview_file_url : post.file_url)
      : transparent

    return (
      <Wrapper>
        <BackgroundImage src={src} onLoad={this.mainImageLoaded} />
        <MainImage innerRef={this.saveImageRef} src={src} isLoading={loading} />
        <Meta>{post && generatePostTitle(post)}</Meta>
      </Wrapper>
    )
  }
}

export default connect(
  ({ posts: { data }, splash: { posts }, config: { danbooru } }) => ({
    data,
    posts,
    danbooru
  })
)(Splash)

const randAdjust = function self(index) {
  return self[index] || (self[index] = 1 - Math.random())
}

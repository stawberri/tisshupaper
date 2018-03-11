import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { fetch } from 'store/actions/splash'
import { generatePostTitle } from 'utils/danbooru'
import { resize, contained, coverage } from 'utils/image'

import Image from './image'

const blurStrength = 'calc((5vw + 5vh) / 2)'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;

  height: 100%;
`

const BackgroundImage = styled(Image).attrs({ cover: true })`
  position: fixed;
  top: calc(-2 * ${blurStrength});
  left: calc(-2 * ${blurStrength});
  width: calc(4 * ${blurStrength} + 100vw);
  height: calc(4 * ${blurStrength} + 100vh);

  filter: blur(${blurStrength});

  z-index: -1;
  pointer-events: none;
`

const MainImage = styled(Image).attrs({ cover: true })`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Meta = styled.p`
  position: fixed;
  bottom: 0;

  box-sizing: border-box;
  height: 2rem;
  max-width: 100%;

  padding: 0 1rem;
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  margin: 0 0 1rem;
  margin-bottom: max(1rem, env(safe-area-inset-bottom));

  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;

  background: rgba(255, 255, 255, 0.69);
  white-space: nowrap;
  overflow: hidden;
`

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      height: 0,
      pickedPost: null
    }
  }

  componentDidMount() {
    this.preloadImg = document.createElement('img')
    this.preloadImg.addEventListener('load', this.preloadLoaded)

    const { dispatch } = this.props
    dispatch(fetch(200))

    this.updateImageSize()

    window.addEventListener('resize', this.updateImageSize)
  }

  componentWillReceiveProps(props) {
    const { posts } = props
    const { posts: oldPosts } = this.props
    if (posts !== oldPosts && posts.length) this.pickPost(props)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.updateImageAnimationFrame)
    window.removeEventListener('resize', this.updateImageSize)
    this.preloadImg.removeEventListener('load', this.preloadLoaded)
  }

  updateImageSize = async () => {
    if (this.updateImageAnimationFrame)
      cancelAnimationFrame(this.updateImageAnimationFrame)

    await new Promise(
      done => (this.updateImageAnimationFrame = requestAnimationFrame(done))
    )

    delete this.updateImageAnimationFrame

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })

    this.pickPost()
  }

  pickPost(props = this.props) {
    const { width, height } = this.state
    const { data, posts, danbooru } = props
    if (!posts.length) return

    let pickedPost = null
    let pickedScore = -Infinity

    const size = { width, height }

    posts.forEach((id, index) => {
      let score = 0
      const post = data[id]
      const postSize = { width: post.image_width, height: post.image_height }
      const resized = resize(postSize, size, true)

      const indexScore = 1 - index / 200
      const rawCoverageScore = coverage(postSize, size)
      const missingScore = coverage(size, resized)

      score += indexScore * 2
      score += rawCoverageScore
      score += missingScore * (1 + !contained(postSize, size))

      if (score > pickedScore) {
        pickedScore = score
        pickedPost = post
      }
    })

    if (!this.state.pickedPost || this.state.pickedPost.id !== pickedPost.id) {
      this.setState({ pickedPost })
      this.preloadId = pickedPost.id
      this.preloadImg.src = danbooru.url(pickedPost.file_url)
    }
  }

  render() {
    const { pickedPost: post } = this.state

    return (
      <Wrapper>
        <BackgroundImage id={post && post.id} />
        <MainImage id={post && post.id} />
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

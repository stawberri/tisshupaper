import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { generatePostTitle } from 'utils/danbooru'
import { resize, contained, coverage } from 'utils/image'
import resized from 'utils/resized'

import Image from './image'
import ImageFader from './image-fader'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;

  height: 100%;
`

const blurStrength = 'calc((5vw + 5vh) / 2)'
const BackgroundImage = styled(Image).attrs({ cover: true })`
  position: absolute;
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

  transition: opacity 0.5s, filter 0.5s;

  &.-loading,
  &.-enter {
    opacity: 0;
    filter: brightness(2);
  }

  &.-exit {
    transition: opacity 0.5s, filter 0.2s;
  }

  &.-exit-active {
    opacity: 0;
    filter: brightness(5);
  }
`

const Meta = styled.p`
  position: absolute;
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

  backdrop-filter: blur(0.3rem);
`

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      height: 0
    }
  }

  updateImageSize(width, height) {
    this.setState({ width, height })
  }

  wrapperRef = ref => {
    if (this.unobserveWrapper) this.unobserveWrapper()
    this.unobserveWrapper = resized(ref, entry => {
      const { width, height } = entry.contentRect
      this.updateImageSize(width, height)
    })

    let { clientWidth: width, clientHeight: height } = ref
    this.updateImageSize(width, height)
  }

  pickPost(props = this.props) {
    const { width, height } = this.state
    const { data, posts } = props
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

    return pickedPost
  }

  render() {
    const post = this.pickPost()

    return (
      <Wrapper innerRef={this.wrapperRef}>
        {post && (
          <React.Fragment>
            {false && <BackgroundImage id={post.id} size={0} />}
            <ImageFader classNames="" timeout={500}>
              <MainImage id={post.id} />
            </ImageFader>
            <Meta>{generatePostTitle(post)}</Meta>
          </React.Fragment>
        )}
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

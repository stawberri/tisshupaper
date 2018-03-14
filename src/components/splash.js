import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { generatePostTitle } from 'utils/danbooru'
import { resize, contained, coverage } from 'utils/image'
import resized from 'utils/resized'

import Image from './image'
import ImageFader from './image-fader'
import { spring, Motion } from 'react-motion'
import Tisshupaper from './tisshupaper'

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
      height: 0,
      currentId: 0,
      changed: false,
      now: 0,
      timeOffset: Math.floor(Math.random() * 86400000)
    }
  }

  componentDidMount() {
    this.timeInterval = setInterval(
      () => this.setState({ now: Date.now() }),
      60000
    )
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval)
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

  postLoad = async ({ id }) => {
    if (this.state.currentId === id) return

    await new Promise(done =>
      this.setState({ currentId: id, changed: true }, done)
    )

    this.setState({ changed: false })
  }

  pickPost(props = this.props) {
    const { width, height, now, timeOffset } = this.state
    const { data, posts } = props
    if (!posts.length) return

    const size = { width, height }

    const maxScore = findMaxScore(posts, data)
    const sortedPosts = posts
      .map((id, index) => {
        let score = 0
        const post = data[id]
        const postSize = { width: post.image_width, height: post.image_height }
        const resized = resize(postSize, size, true)

        const indexScore = 1 - index / posts.length
        const scoreScore = post.score / maxScore
        const aspectRatioScore = coverage(postSize, size)
        const croppedOffScore = coverage(size, resized)

        score += indexScore
        score += scoreScore
        score += aspectRatioScore
        score += croppedOffScore
        if (contained(size, postSize)) score += croppedOffScore

        return [score, post]
      })
      .sort((a, b) => b[0] - a[0])

    const select =
      Math.floor((now + timeOffset) / 60000) % Math.min(15, posts.length)

    return sortedPosts[select][1]
  }

  render() {
    const { currentId, changed } = this.state
    const { data } = this.props

    const post = this.pickPost()
    const current = data[currentId]

    const metaStyle = {
      translateX: changed ? -100 : spring(0)
    }

    return (
      <Wrapper innerRef={this.wrapperRef}>
        {!current && <Tisshupaper />}
        {post && (
          <React.Fragment>
            {false && <BackgroundImage id={current.id} size={0} />}
            <ImageFader classNames="" timeout={500} onLoad={this.postLoad}>
              <MainImage id={post.id} />
            </ImageFader>
            {current && (
              <Motion style={metaStyle}>
                {({ translateX }) => (
                  <Meta
                    style={{
                      transform: `translateX(${translateX}%)`
                    }}
                  >
                    {generatePostTitle(current)}
                  </Meta>
                )}
              </Motion>
            )}
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

const maxScores = new WeakMap()
function findMaxScore(posts, data) {
  if (!maxScores.has(posts)) {
    maxScores.set(
      posts,
      posts.reduce(
        (score, post) => Math.max(score, data[post].score),
        -Infinity
      )
    )
  }

  return maxScores.get(posts)
}

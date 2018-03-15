import React from 'react'
import styled from 'styled-components'
import { connect } from '../utils'
import { generatePostTitle, isValidImage } from '../utils/danbooru'
import { resize, contained, coverage } from '../utils/image'
import { resized } from '../utils'

import Image from './image'
import ImageFader from './image-fader'
import { spring, Motion } from 'react-motion'
import Tisshupaper from './tisshupaper'
import { Route, Link } from 'react-router-dom'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;

  height: 100%;
`

const MainImage = styled(Image)`
  position: absolute;
  width: 100%;
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

const HomeLink = styled(Link)`
  position: absolute;
  width: 100%;
  height: 100%;
`

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      height: 0,
      currentId: 0,
      changed: false
    }
  }

  updateImageSize(width, height) {
    this.setState({ width, height })
  }

  wrapperRef = ref => {
    if (this.unobserveWrapper) this.unobserveWrapper()
    if (!ref) return

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
    const { width, height } = this.state
    const { data, posts } = props
    if (!posts.length) return

    const size = { width, height }

    const maxScore = findMaxScore(posts, data)

    let bestPost
    let bestScore = -Infinity

    posts.filter(id => isValidImage(data[id])).forEach((id, index) => {
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
      score += aspectRatioScore * 6
      score += croppedOffScore * 2
      if (contained(size, postSize)) score += croppedOffScore * 4

      if (score > bestScore) {
        bestPost = post
        bestScore = score
      }
    })

    return bestPost
  }

  render() {
    const { currentId, changed } = this.state
    const { data } = this.props

    const post = this.pickPost()
    const current = data[currentId]

    return (
      <React.Fragment>
        {!current && <Tisshupaper />}

        <Route path="/home">
          {({ match }) =>
            post ? (
              <Wrapper innerRef={this.wrapperRef}>
                <Motion
                  style={{
                    i: spring(+!match),
                    ...(match
                      ? { top: spring(5), height: spring(15) }
                      : { top: spring(0), height: spring(0) })
                  }}
                >
                  {({ i, top, height }) => (
                    <ImageFader onLoad={this.postLoad}>
                      <MainImage
                        id={post.id}
                        spring={i !== +!match && {}}
                        cover={!match}
                        style={{
                          top: `${top}rem`,
                          height: `calc(100% - ${height}rem)`,
                          ...(i !== +!match
                            ? { transform: 'translateZ(0)' }
                            : {})
                        }}
                      />
                    </ImageFader>
                  )}
                </Motion>
                {current && (
                  <Motion
                    style={
                      match
                        ? { translateX: spring(-100) }
                        : { translateX: changed ? -100 : spring(0) }
                    }
                  >
                    {({ translateX }) =>
                      translateX > -100 && (
                        <Meta
                          style={
                            translateX
                              ? {
                                  transform: `translateZ(0) translateX(${translateX}%)`
                                }
                              : null
                          }
                        >
                          {generatePostTitle(current)}
                        </Meta>
                      )
                    }
                  </Motion>
                )}
                {!match && <HomeLink to="/home" />}
              </Wrapper>
            ) : null
          }
        </Route>
      </React.Fragment>
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
      posts.reduce((max, id) => Math.max(max, data[id].score), -Infinity)
    )
  }
  return maxScores.get(posts)
}

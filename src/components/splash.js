import React from 'react'
import styled from 'styled-components'
import { connect } from '../utils'
import { readTagString } from '../utils/danbooru'
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
  height: 100%;
`

const Meta = styled.p`
  position: absolute;
  bottom: 0;

  box-sizing: border-box;
  max-width: 100%;
  margin: 0;
  padding: 1em 1.3em;
  padding-left: max(1.3em, env(safe-area-inset-left));
  padding-right: max(1.3em, env(safe-area-inset-right));
  padding-bottom: max(1em, env(safe-area-inset-bottom));

  font-weight: 900;
  font-size: 2rem;
  color: ${({ theme }) => theme.bg};
  text-shadow: 0 0 0.1em ${({ theme }) => theme.fg},
    0 0 0.5em ${({ theme }) => theme.fg}, 0 0 1em ${({ theme }) => theme.fg};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &::before {
    content: 'illust. ';
    opacity: 0.95;
    font-size: 0.85em;
    font-weight: 600;
  }

  @media (max-width: 25rem) {
    font-size: 1.5rem;
  }
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

    posts.forEach((id, index) => {
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
                      ? {
                          top: spring(0),
                          height: spring(0),
                          left: spring(-100),
                          width: spring(0)
                        }
                      : {
                          top: spring(0),
                          height: spring(0),
                          left: spring(0),
                          width: spring(0)
                        })
                  }}
                >
                  {({ i, left, top, width, height }) => (
                    <ImageFader onLoad={this.postLoad}>
                      <MainImage
                        id={post.id}
                        spring={i !== +!match && {}}
                        cover={!match}
                        style={
                          left
                            ? {
                                top: `${top}rem`,
                                left: `${left}%`,
                                height: `calc(100% - ${height}rem)`,
                                width: `calc(100% - ${width}%)`,
                                ...(i !== +!match
                                  ? { transform: 'translateZ(0)' }
                                  : {})
                              }
                            : undefined
                        }
                      />
                    </ImageFader>
                  )}
                </Motion>

                {current && (
                  <Motion
                    style={
                      match
                        ? { opacity: spring(0) }
                        : { opacity: changed ? 0 : spring(1) }
                    }
                  >
                    {({ opacity }) =>
                      opacity > 0 && (
                        <Meta
                          style={
                            opacity < 1
                              ? { opacity, transform: `translateZ(0)` }
                              : undefined
                          }
                        >
                          {readTagString(current.tag_string_artist)}
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

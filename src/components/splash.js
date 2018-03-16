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
import { Route, Link, matchPath } from 'react-router-dom'
import Home from './home'

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

const Meta = styled.figcaption`
  position: absolute;
  left: 0;
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
      imagePos: null,
      enableSpring: false
    }
  }

  componentDidMount() {
    const { location, history } = this.props

    let lastMatch = !!matchPath(location.pathname, { path: '/home' })
    this.listenHistory = history.listen(location => {
      if (!matchPath(location.pathname, { path: '/home' }) === lastMatch) {
        this.setState({ enableSpring: true })
        lastMatch = !lastMatch
      }
    })
  }

  componentWillUnmount() {
    this.listenHistory()
  }

  enableSpring = () => {
    this.setState({ enableSpring: true })
  }

  disableSpring = () => {
    this.setState({ enableSpring: false })
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
    this.setState({ currentId: id })
  }

  postTarget = imagePos => {
    this.setState({ imagePos })
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
    return <Route path="/home" children={this.renderMatch} />
  }

  renderMatch = ({ match }) => {
    const { currentId, imagePos, width, height, enableSpring } = this.state
    const { data } = this.props

    const post = this.pickPost()
    const current = data[currentId]

    const springSettings = { stiffness: 200, damping: 19 }
    const conditionalSpring = value =>
      enableSpring ? spring(value, springSettings) : value

    return (
      <Wrapper innerRef={this.wrapperRef}>
        {!current && <Tisshupaper />}
        {match && <Home post={current} onPostTarget={this.postTarget} />}
        {post && (
          <Motion
            onRest={this.disableSpring}
            style={
              match && imagePos
                ? {
                    top: conditionalSpring(imagePos.top),
                    height: conditionalSpring(imagePos.height),
                    left: conditionalSpring(imagePos.left),
                    width: conditionalSpring(imagePos.width)
                  }
                : {
                    top: conditionalSpring(0),
                    height: conditionalSpring(height),
                    left: conditionalSpring(0),
                    width: conditionalSpring(width)
                  }
            }
          >
            {({ left, top, width, height }) => (
              <ImageFader onLoad={this.postLoad}>
                <MainImage
                  id={post.id}
                  spring={enableSpring && springSettings}
                  cover={!match}
                  style={
                    top || left
                      ? {
                          top,
                          left,
                          height,
                          width,
                          ...(enableSpring
                            ? { transform: 'translateZ(0)' }
                            : {})
                        }
                      : undefined
                  }
                >
                  <Motion style={{ opacity: spring(+!match, springSettings) }}>
                    {({ opacity }) =>
                      opacity > 0 && (
                        <Meta
                          style={
                            opacity < 1
                              ? { opacity, transform: `translateZ(0)` }
                              : undefined
                          }
                        >
                          {readTagString(post.tag_string_artist)}
                        </Meta>
                      )
                    }
                  </Motion>
                </MainImage>
              </ImageFader>
            )}
          </Motion>
        )}
        {!match && <HomeLink to="/home" />}
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
      posts.reduce((max, id) => Math.max(max, data[id].score), -Infinity)
    )
  }
  return maxScores.get(posts)
}

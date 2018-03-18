import React from 'react'
import styled from 'styled-components'
import { connect } from '../utils'
import { readTagString } from '../utils/danbooru'
import { resize, contained, coverage } from '../utils/image'
import { resized } from '../utils'

import Image from './image'
import { spring, Motion, TransitionMotion } from 'react-motion'
import Tisshupaper from './tisshupaper'
import { Route, Link, matchPath } from 'react-router-dom'
import Home from './home'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  overflow: hidden;

  height: 100%;
`

const MainImage = styled(Image)`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: visible;
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

const Error = styled(Link)`
  position: absolute;

  display: block;
  padding: 1rem 1rem 0.5rem;

  text-align: center;
  text-decoration: none;
  color: ${({ theme }) => theme.bg};

  background: ${({ theme }) => theme.darkText};
  box-shadow: 0 0 2rem 2rem ${({ theme }) => theme.darkText};
`

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      height: 0,
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

  transitionEnter() {
    return { opacity: 0 }
  }

  transitionLeave() {
    return { opacity: spring(0) }
  }

  render() {
    return (
      <Route path="/home" children={this.renderMatch}>
        {props => (
          <Route path="/" exact>
            {({ match }) => this.renderMatch({ ...props, indexMatch: match })}
          </Route>
        )}
      </Route>
    )
  }

  renderMatch = ({ match, indexMatch, location }) => {
    const { imagePos, width, height, enableSpring } = this.state
    const springSettings = { stiffness: 200, damping: 19 }

    const post = this.pickPost()
    const conditionalSpring = value =>
      enableSpring ? spring(value, springSettings) : value

    return (
      <Wrapper innerRef={this.wrapperRef}>
        {!post && <Tisshupaper />}
        <Motion style={{ opacity: spring(+!!match) }}>
          {({ opacity }) =>
            opacity ? (
              <Home
                post={post}
                onPostTarget={this.postTarget}
                style={
                  opacity < 1
                    ? { opacity, transform: `translateZ(0)` }
                    : undefined
                }
              />
            ) : null
          }
        </Motion>
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
            {imagePos => (
              <TransitionMotion
                styles={[
                  {
                    key: `${post.id}`,
                    data: { post },
                    style: { opacity: spring(1) }
                  }
                ]}
                willEnter={this.transitionEnter}
                willLeave={this.transitionLeave}
              >
                {this.renderTransition(match, imagePos)}
              </TransitionMotion>
            )}
          </Motion>
        )}
        <Motion style={{ opacity: spring(+(!indexMatch && !match)) }}>
          {({ opacity }) =>
            opacity ? (
              <Error
                to="/"
                style={
                  opacity < 1
                    ? {
                        opacity,
                        pointerEvents: 'none',
                        transform: 'translateZ(0)'
                      }
                    : undefined
                }
              >
                <FontAwesome icon="exclamation-triangle" size="4x" />
                <h1>404</h1>
                <p>Page not found</p>
              </Error>
            ) : null
          }
        </Motion>
      </Wrapper>
    )
  }

  renderTransition = (match, imagePos) => styles => {
    const { width, height, enableSpring } = this.state
    const springSettings = { stiffness: 200, damping: 19 }

    return (
      <React.Fragment>
        {styles.map(({ key, data: { post }, style: { opacity } }) => (
          <MainImage
            key={key}
            id={post.id}
            onLoad={this.postLoad}
            spring={enableSpring && springSettings}
            cover={!match}
            to={match ? '/' : '/home'}
            style={{
              ...(opacity < 1
                ? { opacity, filter: `brightness(${3 - opacity * 2})` }
                : {}),
              ...(imagePos.top ||
              imagePos.left ||
              imagePos.width !== width ||
              imagePos.height !== height
                ? {
                    top: imagePos.top,
                    left: imagePos.left,
                    height: imagePos.height,
                    width: imagePos.width
                  }
                : {}),
              ...(enableSpring || opacity < 1
                ? { transform: 'translateZ(0)' }
                : {})
            }}
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
                    {readTagString(post.tag_string_artist) || '(unknown)'}
                  </Meta>
                )
              }
            </Motion>
          </MainImage>
        ))}
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

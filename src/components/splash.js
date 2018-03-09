import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { fetch } from 'store/actions/splash'

import { generatePostTitle } from 'utils/danbooru'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;

  height: 100%;
  box-sizing: border-box;

  display: flex;
  flex-flow: column nowrap;
`

const BackgroundImage = styled.img`
  --blur-strength: calc((5vw + 5vh) / 2);

  position: absolute;
  top: calc(-2 * var(--blur-strength));
  left: calc(-2 * var(--blur-strength));
  width: calc(4 * var(--blur-strength) + 100vw);
  height: calc(4 * var(--blur-strength) + 100vh);

  object-fit: cover;

  filter: blur(var(--blur-strength));

  z-index: -1;
  pointer-events: none;
`

const MainImage = styled.img`
  flex: auto;
  min-height: 0;

  margin: 1rem 2rem 0;

  object-fit: scale-down;
`

const Meta = styled.p`
  align-self: center;
  box-sizing: border-box;
  max-width: calc(100% - 4rem);
  height: 2.5rem;
  padding: 0 1rem;
  margin: 0.69rem 0;
  border-radius: 0.5rem;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  background: white;

  white-space: nowrap;
`

const transparent =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

class Splash extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      imageWidth: 0,
      imageHeight: 0
    }
  }

  componentDidMount() {
    const { dispatch } = this.props

    this.fetchInterval = window.setInterval(() => dispatch(fetch()), 300000)
    dispatch(fetch())

    window.addEventListener('resize', this.updateImageSize)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.updateImageAnimationFrame)
    window.removeEventListener('resize', this.updateImageSize)
    window.clearTimeout(this.fetchInterval)
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
    })
  }

  pickPost() {
    const { data, posts } = this.props
    if (!posts.length) return

    const splashPosts = posts.map(id => data[id])
    return splashPosts[0]
  }

  render() {
    const { danbooru } = this.props
    const post = this.pickPost()

    const src = post ? danbooru.url(post.large_file_url) : transparent

    return (
      <Wrapper>
        <BackgroundImage src={src} />
        <MainImage innerRef={this.saveImageRef} src={src} />
        <Meta>{post ? generatePostTitle(post) : 'Loading'}</Meta>
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

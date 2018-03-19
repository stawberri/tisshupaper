import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import {
  getDanbooruInstance,
  postSourceURL,
  generatePostTitle
} from '../utils/danbooru'
import { remove as removeDiscover } from '../store/actions/discover'

import Header from './header'
import Image from './image'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  grid-gap: 1em;

  height: 100%;
`

const Main = styled.main`
  display: grid;
  grid:
    'picture' 2fr
    'info' auto
    'actions' auto / auto;
`

const Picture = styled(Image)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
`

const Info = styled.div`
  margin: 1em 1em 0;
  margin-left: max(1em, env(safe-area-inset-left));
  margin-right: max(1em, env(safe-area-inset-right));

  text-align: center;
`

const Actions = styled.div`
  grid-area: actions;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  padding: 1rem 0;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));

  font-size: 1.5rem;

  button {
    background: none;
    border: none;

    color: inherit;
    margin: 0 0.5em;
    padding: 0;
  }

  a {
    color: inherit;
    margin: 0 0.5em;
  }
`

class Discover extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      post: null
    }
  }

  componentDidMount() {
    this.pickPost()
  }

  componentDidUpdate() {
    this.pickPost()
  }

  pickPost() {
    if (this.state.post) return

    const { data, posts } = this.props

    const validIds = Object.keys(posts)
    const id = validIds[Math.floor(Math.random() * validIds.length)]
    const post = data[id]

    if (post) this.setState({ post })
  }

  removePost = () => {
    const { post } = this.state
    const { dispatch } = this.props
    if (!post) return

    dispatch(removeDiscover([post.id]))
    this.setState({ post: null })
  }

  render() {
    const { post } = this.state
    const { danbooru } = this.props

    return (
      <Wrapper>
        <Header to="/home">Discover (WIP)</Header>
        {post && (
          <Main>
            <Picture id={post.id} />
            <Info>{generatePostTitle(post)}</Info>
            <Actions>
              <a
                href={danbooru.url(post.file_url)}
                target="_blank"
                rel="noopener"
              >
                <FontAwesome icon="download" />
              </a>
              <button style={{ opacity: 0.5, pointerEvents: 'none' }}>
                <FontAwesome icon="heart" />
              </button>
              <button onClick={this.removePost}>
                <FontAwesome icon="sync" size="lg" />
              </button>
              <a href={postSourceURL(post)} target="_blank" rel="noopener">
                <FontAwesome icon="external-link-alt" />
              </a>
              <a
                href={danbooru.url(`/posts/${post.id}`)}
                target="_blank"
                rel="noopener"
              >
                <FontAwesome icon="link" />
              </a>
            </Actions>
          </Main>
        )}
      </Wrapper>
    )
  }
}

export default connect(
  ({ posts: { data }, discover: { posts }, config: { danbooru } }) => ({
    data,
    posts,
    danbooru: getDanbooruInstance(danbooru)
  })
)(Discover)

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { getDanbooruInstance, postSourceURL } from '../utils/danbooru'
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
    'picture info' 1fr
    'actions actions' auto / 2fr 1fr;

  @media (max-aspect-ratio: 1 / 1) {
    grid:
      'picture' 2fr
      'info' auto
      'actions' auto / auto;
  }
`

const Picture = styled(Image)`
  box-sizing: border-box;
  padding: 0 1em;
  width: 100%;
  height: 100%;

  @media (max-aspect-ratio: 1 / 1) {
    padding: 0;
  }
`

const Info = styled.div`
  margin: 1em;

  h1,
  p {
    margin-top: 0;
  }
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
        <Header to="/home">Discover</Header>
        {post && (
          <Main>
            <Picture id={post.id} />
            <Info>
              <h1>Artists</h1>
              <ul>
                {post.tag_string_artist &&
                  post.tag_string_artist.split(' ').map(tag => {
                    tag = tag.replace(/_/g, ' ')
                    return <li key={tag}>{tag}</li>
                  })}
              </ul>
              <h1>Materials</h1>
              <ul>
                {post.tag_string_copyright &&
                  post.tag_string_copyright.split(' ').map(tag => {
                    tag = tag.replace(/_/g, ' ')
                    return <li key={tag}>{tag}</li>
                  })}
              </ul>
              <h1>Characters</h1>
              <ul>
                {post.tag_string_character &&
                  post.tag_string_character.split(' ').map(tag => {
                    tag = tag.replace(/_/g, ' ')
                    return <li key={tag}>{tag}</li>
                  })}
              </ul>
            </Info>
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

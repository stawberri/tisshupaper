import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { getDanbooruInstance } from '../utils/danbooru'

import Header from './header'
import Image from './image'
import FontAwesome from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100%;
`

const Main = styled.main`
  display: grid;
  grid:
    'picture info' 1fr
    'actions actions' auto / 2fr 1fr;
`

const Picture = styled(Image)`
  box-sizing: border-box;
  padding: 1em 1em 0;
  width: 100%;
  height: 100%;
`

const Info = styled.div``

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

    &:active {
      outline: none;
    }
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

  render() {
    const { post } = this.state

    return (
      <Wrapper>
        <Header to="/home">Discover</Header>
        {post && (
          <Main>
            <Picture id={post.id} />
            <Info />
            <Actions>
              <button>
                <FontAwesome icon="trash" size="lg" />
              </button>
              <button>
                <FontAwesome icon="heart" size="lg" />
              </button>
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

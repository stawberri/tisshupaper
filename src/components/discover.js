import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { getDanbooruInstance } from '../utils/danbooru'

import Header from './header'
import Image from './image'

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100%;
`

const Main = styled.main``

const Picture = styled(Image)`
  width: 100%;
  height: 100%;
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

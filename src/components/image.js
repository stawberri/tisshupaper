import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0 !important;

  background-color: white;
`

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
`

class Image extends React.Component {
  render() {
    const { className, imageRef, post } = this.props

    return (
      <Wrapper className={className} innerRef={imageRef}>
        {post && post.large_file_url && <Img src={post.large_file_url} />}
      </Wrapper>
    )
  }
}

export default connect(({ posts: data }, { id }) => ({ post: data[id] }))(Image)

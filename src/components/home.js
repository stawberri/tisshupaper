import React from 'react'
import styled from 'styled-components'
import { resized } from '../utils'
import { generatePostTitle } from '../utils/danbooru'

import Header from './header'

const Wrapper = styled.main`
  position: absolute;
  height: 100%;
  width: 100%;

  display: grid;
  grid:
    'header header' auto
    'image caption' 1fr
    'footer footer' auto / 1fr 30rem;
  grid-gap: 1rem 2rem;
`

const StyledHeader = styled(Header)`
  grid-area: header;
`

const Picture = styled.div`
  grid-area: image;

  margin-left: 1rem;
`

const Caption = styled.div`
  grid-area: caption;

  margin-right: 1rem;

  font-size: 2rem;
`

const Menu = styled.nav`
  grid-area: footer;
`

export default class Home extends React.Component {
  pictureRef = ref => {
    if (this.unobservePicture) this.unobservePicture()
    if (!ref) return

    const notifyParent = () => {
      const { top, left, width, height } = ref.getBoundingClientRect()
      const { onPostTarget } = this.props
      if (onPostTarget) onPostTarget({ top, left, width, height })
    }

    this.unobservePicture = resized(ref, notifyParent)
    notifyParent()
  }

  render() {
    const { post } = this.props

    return (
      <Wrapper>
        <StyledHeader to="/">Tisshupaper</StyledHeader>
        <Picture innerRef={this.pictureRef} />
        <Caption>{post && generatePostTitle(post)}</Caption>
        <Menu>Menu goes here</Menu>
      </Wrapper>
    )
  }
}

import React from 'react'
import styled from 'styled-components'
import { resized } from '../utils'

import Header from './header'
import Image from './image'

const Wrapper = styled.main`
  position: absolute;
  height: 100%;
  width: 100%;

  display: grid;
  grid:
    'header header' auto
    'image caption' 1fr
    'footer footer' auto / 1fr 30rem;
  grid-gap: 1rem;
`

const StyledHeader = styled(Header)`
  grid-area: header;
`

const Picture = styled.div`
  grid-area: image;
  overflow: hidden;
`

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;

  transform: translateZ(0);
  filter: blur(100px);
`

const Caption = styled.div`
  grid-area: caption;

  padding: 0.8rem 1rem;

  font-size: 3rem;
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
    const { post = {} } = this.props

    return (
      <Wrapper>
        <StyledHeader to="/">Tisshupaper</StyledHeader>
        <Picture innerRef={this.pictureRef}>
          <StyledImage id={post.id} cover size={0} />
        </Picture>
        <Caption>Caption</Caption>
        <Menu>Menu goes here</Menu>
      </Wrapper>
    )
  }
}

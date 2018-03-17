import React from 'react'
import styled from 'styled-components'
import { resized } from '../utils'
import { generatePostTitle } from '../utils/danbooru'
import { connect } from 'react-redux'

import Header from './header'
import Menubar from './menubar'
import FontAwesome from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const Wrapper = styled.main`
  position: absolute;
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: auto 1fr auto;

  color: ${({ theme }) => theme.fg};
`

const StyledHeader = styled(Header)`
  grid-row: 1 / 2;
`

const Image = styled.div`
  grid-row: 2 / 3;

  display: flex;
  flex-flow: column;

  box-sizing: border-box;
  border: 2px solid ${({ theme }) => theme.fg};
  margin: 1em;
  padding: 0.25rem 0;
  margin-left: max(1em, env(safe-area-inset-left));
  margin-right: max(1em, env(safe-area-inset-right));
  border-radius: 0.5em;
  box-shadow: 0 0.1em ${({ theme }) => theme.lightText};

  overflow: hidden;
`

const NoImage = styled.div`
  grid-row: 2 / 3;
`

const Caption = styled.div`
  margin: 0 1em 0.5rem;

  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;

  width: calc(100% - 2em);
  overflow: hidden;
`

const Picture = styled.div`
  flex: 1;
`

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.5rem 0 0;

  a {
    display: block;
    border-radius: 5em;
    padding: 0.1em;
    margin: 0 1em;

    color: inherit;
    font-size: 1.5rem;
  }
`

const Menu = styled(Menubar)`
  grid-row: 3 / 4;
`

class Home extends React.Component {
  pictureRef = ref => {
    if (this.unobservePicture) this.unobservePicture()
    if (!ref) return

    const notifyParent = () => {
      const { top, left, width, height } = ref.getBoundingClientRect()
      const { onPostTarget } = this.props
      const adjustedTop = window.scrollY + top
      const adjustedLeft = window.scrollX + left
      if (onPostTarget)
        onPostTarget({ top: adjustedTop, left: adjustedLeft, width, height })
    }

    this.unobservePicture = resized(ref, notifyParent)
    notifyParent()
  }

  render() {
    const { danbooru, post } = this.props

    return (
      <Wrapper>
        <StyledHeader to="/">Tisshupaper</StyledHeader>
        {post ? (
          <Image>
            <Caption>{generatePostTitle(post)}</Caption>
            <Picture innerRef={this.pictureRef} />
            <Buttons>
              <Link to={`/like/${post.id}`}>
                <FontAwesome icon={['far', 'heart']} />
              </Link>
              <a
                href={danbooru.url(post.file_url)}
                target="_blank"
                rel="noopener"
              >
                <FontAwesome icon="download" />
              </a>
              <a
                href={danbooru.url(`/posts/${post.id}`)}
                target="_blank"
                rel="noopener"
              >
                <FontAwesome icon="external-link-square-alt" />
              </a>
            </Buttons>
          </Image>
        ) : (
          <NoImage />
        )}
        <Menu />
      </Wrapper>
    )
  }
}

export default connect(({ config: { danbooru } }) => ({ danbooru }))(Home)

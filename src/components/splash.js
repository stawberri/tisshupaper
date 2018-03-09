import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { fetch } from '../store/actions/splash'

import Image from './image'

const Wrapper = styled.div`
  height: 100%;
  box-sizing: border-box;

  display: flex;
  flex-flow: column nowrap;

  background: black;
`

const MainImage = styled(Image)`
  flex: 1;

  margin: 2rem 2rem 0;
`

const Meta = styled.p`
  align-self: center;
  box-sizing: border-box;
  min-width: 25%;
  max-width: 50%;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  margin: 0.75rem 2rem;
  border-radius: 0.5rem;
  overflow: hidden;

  background: white;

  font-size: 1.5rem;
  text-align: center;
  white-space: nowrap;
`

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

    dispatch(fetch())
    window.addEventListener('resize', this.updateImageSize)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.updateImageAnimationFrame)
    window.removeEventListener('resize', this.updateImageSize)
  }

  saveImageRef = ref => {
    if (ref) this.mainImageRef = ref
    this.updateImageSize()
  }

  updateImageSize = () => {
    if(this.updateImageAnimationFrame) return
    this.updateImageAnimationFrame = requestAnimationFrame(() => {
      delete this.updateImageAnimationFrame

      const ref = this.mainImageRef
      if(!ref) return

      this.setState({
        imageWidth: ref.clientWidth,
        imageHeight: ref.clientHeight
      })
    })
  }

  render() {
    return (
      <Wrapper>
        <MainImage imageRef={this.saveImageRef} />
        <Meta>Meow</Meta>
      </Wrapper>
    )
  }
}

export default connect(({ posts: { data }, splash: { posts } }) => ({
  data,
  posts
}))(Splash)

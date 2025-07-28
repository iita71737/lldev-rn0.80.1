import React from 'react'
import { View, Text } from 'react-native'
import { WsIcon, WsHtmlRender } from '@/components'
const Diff = require('diff')
import $color from '@/__reactnative_stone/global/color'

const WsDiffText = props => {
  // Props
  const {
    leadingIcon,
    title,
    content,
    originContent,
    amendContent,
    style,
    originName,
    amendName
  } = props

  // State
  const [diffContent, setDiffContent] = React.useState([])
  const [diffName, setDiffName] = React.useState([])

  // Function
  const $_getDiff = () => {
    let _diffContent = []
    let _diffName = []
    if (amendContent) {
      _diffContent = Diff.diffChars(originContent, amendContent)
    }
    setDiffContent(_diffContent)
    if (amendName) {
      _diffName = Diff.diffChars(originName, amendName)
    }
    setDiffName(_diffName)
  }

  React.useEffect(() => {
    $_getDiff()
  }, [originContent, amendContent, originName, amendName])

  // Render
  return (
    <>
      {diffContent && (
        <View
          style={[
            {
              padding: 16,
              backgroundColor: $color.primary11l
            },
            style
          ]}>
          {title && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
              {leadingIcon && (
                <WsIcon
                  style={{
                    marginRight: 8
                  }}
                  name={leadingIcon}
                  size={20}
                  color={$color.primary}
                />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  lineHeight: 20,
                  letterSpacing: 1,
                  color: $color.primary
                }}>
                {title}
              </Text>
            </View>
          )}
          {!amendContent && content?.length > 0 && (
            <View
              style={{
                marginTop: 16
              }}>
              <WsHtmlRender content={content} />
            </View>
          )}

          {amendName && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: 16
              }}>
              {diffName.map(contentItem => {
                let _content = null
                if (contentItem.added) {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <Text
                          key={contentTextKey}
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            letterSpacing: 1,
                            color: $color.black,
                            backgroundColor: $color.primary8l
                          }}>
                          {contentText}
                        </Text>
                      )
                    })
                } else if (contentItem.removed) {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <View
                          key={contentTextKey}
                          style={{
                            backgroundColor: $color.danger8l
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              lineHeight: 22,
                              letterSpacing: 1,
                              color: $color.black
                            }}>
                            {contentText}
                          </Text>
                          <View
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 10,
                              height: 2,
                              width: '100%',
                              backgroundColor: '#dd4e41'
                            }}
                          />
                        </View>
                      )
                    })
                } else {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <Text
                          key={contentTextKey}
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            letterSpacing: 1,
                            color: $color.black
                          }}>
                          {contentText}
                        </Text>
                      )
                    })
                }
                return _content
              })}
            </View>
          )}

          {amendContent && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: 16
              }}>
              {diffContent.map(contentItem => {
                let _content = null
                if (contentItem.added) {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <Text
                          key={contentTextKey}
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            letterSpacing: 1,
                            color: $color.black,
                            backgroundColor: $color.primary8l
                          }}>
                          {contentText}
                        </Text>
                      )
                    })
                } else if (contentItem.removed) {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <View
                          key={contentTextKey}
                          style={{
                            backgroundColor: $color.danger8l
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              lineHeight: 22,
                              letterSpacing: 1,
                              color: $color.black
                            }}>
                            {contentText}
                          </Text>
                          <View
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 10,
                              height: 2,
                              width: '100%',
                              backgroundColor: '#dd4e41'
                            }}
                          />
                        </View>
                      )
                    })
                } else {
                  _content = contentItem.value
                    .split('')
                    .map((contentText, contentTextKey) => {
                      return (
                        <Text
                          key={contentTextKey}
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            letterSpacing: 1,
                            color: $color.black
                          }}>
                          {contentText}
                        </Text>
                      )
                    })
                }
                return _content
              })}
            </View>
          )}
        </View>
      )}
    </>
  )
}

export default WsDiffText

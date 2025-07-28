import React from 'react'
import Snackbar from 'react-native-snackbar'
import $color from '@/__reactnative_stone/global/color'

const WsSnackBar = props => {
  // Props
  const {
    numberOfLines,
    text = '安安你好吃雞蛋',
    duration = Snackbar.LENGTH_LONG,
    textColor = $color.white,
    backgroundColor,
    isAction = true,
    btnColor = $color.primary,
    btnText = '',
    visible = false,
    setVisible,
    quickHidden = false
  } = props
  const action = {
    text: btnText,
    textColor: btnColor,
    onPress: () => {
      setVisible(false)
    }
  }

  // Function
  const $_snackbarOpen = () => {
    Snackbar.show({
      text: text,
      duration: duration,
      numberOfLines: numberOfLines,
      textColor: textColor,
      backgroundColor: backgroundColor,
      action: isAction ? action : null
    })
    $_setVisible()
  }
  const $_setVisible = () => {
    if (quickHidden) {
      setVisible(false)
    } else if (duration == Snackbar.LENGTH_SHORT) {
      setTimeout(() => {
        setVisible(false)
      }, 1000)
    } else if (duration == Snackbar.LENGTH_LONG) {
      setTimeout(() => {
        setVisible(false)
      }, 3000)
    }
  }

  React.useEffect(() => {
    if (!visible) {
      return
    } else {
      $_snackbarOpen()
    }
  }, [visible])

  // Render
  return <></>
}
export default WsSnackBar

import React, { useState, useEffect } from 'react'
import i18next from 'i18next';

const CheckListCreateStepThree = () => {


  //FormView
  const [isSubmitable, setIsSubmitable] = React.useState(false)


  // headerRight
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16,
              }}
              isDisabled={isSubmitable}
              onPress={() => {
              }}
            >{i18next.t('下一步')}</WsBtn>
          </>
        )
      },
    })
  }

  useEffect(() => {
    $_setNavigationOption()
  }, [isSubmitable])
  return (
    <>
    </>
  )
}

export default CheckListCreateStepThree
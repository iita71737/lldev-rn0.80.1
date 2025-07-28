import React from 'react'
import { WsBtn, WsStateFormView, WsPageScrollView } from '@/components'
import i18next from 'i18next'

const CheckListCreateStep = ({ navigation }) => {
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              isDisabled={!isSubmitable}
              onPress={() => {
                navigation.navigate('CheckListPickTemplate')
              }}>
              {i18next.t('建立')}
            </WsBtn>
          </>
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [isSubmitable])

  //FormView
  const [isSubmitable, setIsSubmitable] = React.useState(false)

  const fields = {
    contactPerson: {
      type: 'text',
      label: '0 0 ',
      hasMarginTop: false,
      autoFocus: true,
      rules: 'required',
      defaultValue: '11'
    },
    writer: {
      type: 'belongsto',
      label: i18next.t('答題者'),
      nameKey: 'name',
      modelName: 'user'
    }
  }
  return (
    <WsPageScrollView>
      <WsStateFormView
        isSubmitable={isSubmitable}
        setIsSubmitable={setIsSubmitable}
        navigation={navigation}
        fields={fields}
      />
    </WsPageScrollView>
  )
}

export default CheckListCreateStep

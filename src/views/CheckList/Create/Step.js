import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsBtn, WsStepsTab, WsText, WsPageScrollView } from '@/components'

import StepOne from '@/sections/CheckList/Create/StepOne'
import StepTwo from '@/sections/CheckList/Create/StepTwo'

const CreateStepOne = ({ route }) => {
  const { id } = route.params

  // State
  const [tabItems] = React.useState([
    {
      value: 'stepOne',
      label: `${t('標籤')}A`,
      view: StepOne,
      props: {
        id: id
      }
    },
    {
      value: 'stepTwo',
      label: `${t('標籤')}B`,
      view: StepTwo
    },
    {
      value: 'stepThree',
      label: `${t('標籤')}C`,
      view: StepOne
    }
  ])
  return (
    <>
      <WsStepsTab title={t('新增點檢表')} tabItems={tabItems} />
    </>
  )
}

export default CreateStepOne

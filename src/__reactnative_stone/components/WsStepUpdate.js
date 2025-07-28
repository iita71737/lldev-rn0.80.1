import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsStepUpdatePage } from '@/components'
import $option from '@/__reactnative_stone/global/option'

const StackSetting = createStackNavigator()
const WsStepUpdate = props => {
  // Props
  const {
    name,
    modelName,
    fields,
    stepSettings,
    afterFinishingTo,
    afterFinishingParams,
    parentId,
    title,
    id,
    versionId,
    submitFunction,
    extraParams
  } = props

  // Render
  return (
    <>
      <StackSetting.Navigator>
        {stepSettings.map((stepSetting, stepSettingIndex) => {
          return (
            <StackSetting.Screen
              key={stepSettingIndex}
              name={`${name}Step${stepSettingIndex + 1}`}
              component={
                stepSetting.component ? stepSetting.component : WsStepUpdatePage
              }
              options={{
                title: title,
                ...$option.headerOption,
                ...TransitionPresets.SlideFromRightIOS,
                headerShown:
                  stepSetting.headerShown != undefined
                    ? stepSetting.headerShown
                    : true
              }}
              initialParams={{
                fields: fields,
                stepSetting: stepSetting,
                currentPage: stepSettingIndex + 1,
                totalPages: stepSettings.length,
                name: name,
                parentId: parentId,
                modelName: modelName,
                modelId: id,
                versionId: versionId,
                afterFinishingTo: afterFinishingTo,
                afterFinishingParams: afterFinishingParams,
                submitFunction: submitFunction,
                extraParams: extraParams
              }}
            />
          )
        })}
      </StackSetting.Navigator>
    </>
  )
}

export default WsStepUpdate

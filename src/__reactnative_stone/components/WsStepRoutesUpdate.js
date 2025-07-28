import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsStepUpdatePage } from '@/components'
import $option from '@/__reactnative_stone/global/option'

const StackSetting = createStackNavigator()
const WsStepRoutesUpdate = ({ route }) => {
  // Params
  const {
    name,
    modelName,
    fields,
    stepSettings,
    afterFinishingTo,
    parentId,
    title,
    id,
    versionId,
    currentUserId,
    submitFunction,
    mode,
    headerRightBtnText002,
    onSubmitDraft
  } = route.params

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
                currentUserId: currentUserId,
                afterFinishingTo: afterFinishingTo,
                submitFunction: submitFunction,
                mode: mode,
                headerRightBtnText002: headerRightBtnText002,
                onSubmitDraft: onSubmitDraft
              }}
            />
          )
        })}
      </StackSetting.Navigator>
    </>
  )
}

export default WsStepRoutesUpdate

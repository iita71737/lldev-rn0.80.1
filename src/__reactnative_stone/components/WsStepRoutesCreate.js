import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsStepCreatePage } from '@/components'
import $option from '@/__reactnative_stone/global/option'

const StackSetting = createStackNavigator()
const WsStepRoutesCreate = ({ route }) => {
  // Params
  const {
    name,
    modelName,
    fields,
    stepSettings,
    afterFinishingTo,
    afterFinishingParams,
    getFormatPostData,
    parentId,
    currentUserId,
    title,
    onSubmit,
    submitFunction,
    versionName,
    from,
    headerRightBtnText,
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
                stepSetting.component ? stepSetting.component : WsStepCreatePage
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
                onSubmit: onSubmit,
                submitFunction: submitFunction,
                parentId: parentId,
                currentUserId: currentUserId,
                modelName: modelName,
                afterFinishingTo: afterFinishingTo,
                afterFinishingParams: afterFinishingParams,
                getFormatPostData: getFormatPostData,
                versionName: versionName,
                from: from,
                headerRightBtnText: headerRightBtnText,
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

export default WsStepRoutesCreate

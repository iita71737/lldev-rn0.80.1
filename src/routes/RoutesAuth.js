import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ViewAuthLoginEmailPassword from '@/__reactnative_stone/views/Auth/LoginEmailPassword'
import ViewAuthLoginClosedVersion from '@/__reactnative_stone/views/Auth/ClosedVersionLogin'
import ViewForgotPwd from '@/__reactnative_stone/views/Auth/ForgotPwd'
import gOption from '@/__reactnative_stone/global/option'

const StackSetting = createStackNavigator()
const RoutesAuth = ({ route }) => {
  return (
    <StackSetting.Navigator
      screenOptions={{
        headerShown: false
      }}>
      <StackSetting.Screen
        name="Login"
        component={ViewAuthLoginEmailPassword}
        options={({ navigation, route }) => ({
          ...gOption.headerOption,
        })}
        initialParams={{ autoFocus: route.params.autoFocus }}
      />
      <StackSetting.Screen
        name="ForgotPwd"
        component={ViewForgotPwd}
        options={{
          ...gOption.headerOption
        }}
      />
      <StackSetting.Screen
        name="Closed_Version_Login"
        component={ViewAuthLoginClosedVersion}
        options={{
          ...gOption.headerOption
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesAuth

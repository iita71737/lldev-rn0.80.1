import React from 'react'
import { Alert, View, Dimensions, TouchableOpacity } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import ViewTrainingIndex from '@/views/Training/Index'
import ViewTrainingShow from '@/views/Training/Show'
import ViewTrainingGroupShow from '@/views/Training/TrainingGroup/Show'
import ViewTrainingUpdate from '@/views/Training/Update'
import ViewTrainingTemplatesPicker from '@/views/Training/Create/PickTemplate'
import { WsStepRoutesCreate, WsStepRoutesUpdate, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import $option from '@/__reactnative_stone/global/option'
import S_InternalTraining from '@/services/api/v1/training'
import ViewTrainingTemplateShow from '@/views/Training/Template/TrainingTemplateShow'
import S_File from '@/services/api/v1/file'
import PickTemplate from '@/views/Audit/Create/PickTemplate'

const StackSetting = createStackNavigator()

const RoutesTraining = () => {
  const { t, i18n } = useTranslation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const systemClasses = useSelector(state => state.data.systemClasses)

  // Fields
  const fields = {
    internal_training_template: {
      type: 'belongsto',
      label: t('公版名稱'),
      modelName: 'internal_training_template',
      hasMeta: false,
      nameKey: 'name',
      rules: 'required',
      renderCustomizedCom: ViewTrainingTemplatesPicker,
    },
    name: {
      label: t('名稱'),
      rules: 'required',
      placeholder: t('輸入')
    },
    train_at: {
      testID: '訓練日期',
      label: t('訓練日期'),
      type: 'date',
      rules: 'required',
      autoAddedField: 'expired_at',
    },
    expired_at: {
      label: t('編輯截止日'),
      type: 'date',
      rules: 'required',
      minimumDateCompareWithField: 'train_at',
    },
    principal: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      rules: 'required',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail'
    },
    system_classes: {
      type: 'belongstomany'
    },
    system_subclasses: {
      type: 'belongstomany'
    },
    remark: {
      label: t('備註'),
      placeholder: t('輸入'),
    },
    file_images: {
      modelName: 'internal_training',
      label: t('照片'),
      type: 'Ll_filesAndImages',
      fileExtension: 'tiff,psd,jpg,png,gif,bmp,jpeg,heic', //副檔名 
      oneFile: true,
      uploadBtnText: t('圖片'),
      uploadBtnIcon: 'md-image'
    },
    file_sign_in_form: {
      modelName: 'internal_training',
      type: 'Ll_filesAndImages',
      label: t('簽到表'),
      oneFile: true,
      uploadBtnText: t('上傳'),
    },
    file_attaches: {
      modelName: 'internal_training',
      type: 'Ll_filesAndImages',
      label: t('附件'),
      uploadBtnText: t('上傳'),
    },
    internal_training_groups: {
    },
    redirect_routes: {
    },
    related_guidelines_articles: {
      type: 'Ll_relatedGuideline',
      label: t('相關內規'),
      modelName: 'guideline',
      serviceIndexKey: 'index',
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc'
      }
    },
  }

  // StepSetting
  const stepSettings = [
    {
      getShowFields(fieldsValue) {
        if (
          fieldsValue &&
          fieldsValue.internal_training_template &&
          fieldsValue.internal_training_template.show_fields
        ) {
          return ['name', ...fieldsValue.internal_training_template.show_fields]
        } else {
          return [
            'internal_training_template',
            'name',
            'train_at',
            'expired_at',
            'principal',
            'sign_in_form',
            'remark',
            'images',
            'attaches',
            'file_images',
            'file_sign_in_form',
            'file_attaches',
            'related_guidelines_articles'
          ]
        }
      }
    }
  ]

  // 新增教育訓練
  const $_submitForCreateTraining = async (
    _postData,
    navigation,
    currentUserId
  ) => {
    // console.log(JSON.stringify(_postData), '_postData');
    try {
      const postData = await S_InternalTraining.getFormattedCreateData(
        _postData,
        factory && factory.Id,
        systemClasses
      )
      // console.log(JSON.stringify(postData), 'postData');
      const res = await S_InternalTraining.create({
        data: postData
      })
      if (_postData.redirect_routes && res) {
        Alert.alert('教育訓練群組新增教育訓練成功')
        navigation.reset({
          index: 1,
          routes: _postData.redirect_routes,
          key: null
        })
      }
      else if (res) {
        Alert.alert('教育訓練新增成功')
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'TrainingIndex'
            },
            {
              name: 'TrainingShow',
              params: {
                id: res.id
              }
            }
          ],
          key: null
        })
      }
    } catch (e) {
      Alert.alert('教育訓練新增異常')
      console.error(e);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TrainingIndex'
          },
        ],
        key: null
      })
    }
  }

  // 編輯教育訓練
  const $_submitForEditTraining = async (
    _formattedValue,
    modelId,
    versionId,
    navigation,
    currentUser,
    parentId,
    systemClasses
  ) => {
    // console.log(JSON.stringify(_formattedValue), '_formattedValue');
    try {
      const postData = await S_InternalTraining.getFormattedEditData(
        _formattedValue,
        parentId,
        systemClasses
      )
      // console.log(JSON.stringify(postData), 'postData');
      // console.log(modelId, 'modelId--');
      const res = await S_InternalTraining.update({
        modelId: modelId,
        data: postData
      })
      if (res) {
        Alert.alert('教育訓練編輯成功')
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'TrainingIndex'
            },
            {
              name: 'TrainingShow',
              params: {
                id: res.id
              }
            }
          ],
          key: null
        })
      }
    } catch (e) {
      Alert.alert('教育訓練編輯異常')
      console.error(e);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TrainingIndex'
          },
        ],
        key: null
      })
    }
  }

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
      <StackSetting.Screen
        name="TrainingIndex"
        component={scopeFilterScreen('internal-training-read', ViewTrainingIndex)}
        options={({ navigation }) => ({
          title: t('教育訓練'),
          // headerShown: false,
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}
        initialParams={{
        }}
      />
      <StackSetting.Screen
        name="TrainingShow"
        component={scopeFilterScreen('internal-training-read', ViewTrainingShow)}
        options={({ navigation }) => ({
          title: t('教育訓練'),
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="TrainingGroupShow"
        component={scopeFilterScreen('internal-training-read', ViewTrainingGroupShow)}
        options={({ navigation }) => ({
          title: t('教育訓練群組'), // 教育訓練群組內頁
          ...$option.headerOption
        })}
      />
      <StackSetting.Screen
        name="TrainingUpdate"
        component={scopeFilterScreen([
          'internal-training-update-creator',
          'internal-training-update-principal',
          'internal-training-update',
        ], WsStepRoutesUpdate)}
        options={({ navigation }) => ({
          title: t('編輯教育訓練'),
          ...$option.headerOption,
          headerShown: false
        })}
        initialParams={{
          name: 'TrainingUpdate',
          title: t('編輯教育訓練'),
          modelName: 'internal_training',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'TrainingShow',
          parentId: factory && factory.id ? factory.id : null,
          currentUserId: currentUser && currentUser.id ? currentUser.id : null,
          extraParams: systemClasses,
          submitFunction: $_submitForEditTraining
        }}
      />

      <StackSetting.Screen
        name="TrainingCreate"
        component={scopeFilterScreen('internal-training-create', WsStepRoutesCreate)}
        options={{
          title: t('新增教育訓練'),
          headerShown: false,
          ...$option.headerOption
        }}
        initialParams={{
          name: 'TrainingCreate',
          title: t('新增教育訓練'),
          modelName: 'internal_training',
          fields: fields,
          stepSettings: stepSettings,
          afterFinishingTo: 'TrainingIndex',
          parentId: factory && factory.id ? factory.id : null,
          currentUserId: currentUser && currentUser.id ? currentUser.id : null,
          submitFunction: $_submitForCreateTraining
        }}
      />

      <StackSetting.Screen
        name="TrainingTemplateShow"
        component={scopeFilterScreen('internal-training-read', ViewTrainingTemplateShow)}
        options={({ navigation }) => ({
          title: t('教育訓練公版'),
          ...$option.headerOption,
          headerLeft: () => (
            <WsIconBtn
              testID="backButton"
              name="md-chevron-left"
              color={$color.white}
              size={32}
              style={{
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          ),
        })}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesTraining

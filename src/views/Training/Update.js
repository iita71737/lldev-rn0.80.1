import React from 'react'
import { WsStateFormView } from '@/components'
import S_Training from '@/services/api/v1/training'
import { useSelector } from 'react-redux'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import { useTranslation } from 'react-i18next'

const TrainingUpdate = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // REDUX
  const factory = useSelector(state => state.data.currentFactory)

  // States
  const [modelData, setModelData] = React.useState()

  // FIELDS
  const fields = {
    internal_training_template: {
      type: 'belongsto',
      label: t('內訓紀錄種類'),
      modelName: 'internal_training_template',
      nameKey: 'name',
      parentId: factory && factory.id
    },
    train_at: {
      label: t('訓練日期'),
      type: 'date'
    },
    principal: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail'
    },
    remark: {
      type: 'text',
      label: t('備註'),
      placeholder: '輸入'
    },
    sign_in_form: {
      type: 'fileOrImage',
      label: t('簽到表'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/internal_training/sign_in_form` : null
    },
    image: {
      label: t('照片'),
      type: 'image',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/internal_training/image` : null
    },
    updated_user: {
      type: 'currentUser'
    }
  }
  // Services
  const $_fetchTraining = async () => {
    try {
      const res = await S_Training.show({
        modelId: id
      })
      setModelData(res)
    } catch (e) {
      console.error(e);
    }
  }

  const $_postTraining = async (formattedValue) => {
    try {
      const res = await S_Training.update({
        data: formattedValue,
        modelId: id
      })
    } catch (e) {
      console.error(e);
    }
  }

  const $_onSubmit = async data => {
    try {
      const _formatedValue = S_Wasa.getPostData(fields, data)
      $_postTraining(_formatedValue)
      const res = await S_Training.update({
        data: _formatedValue,
        modelId: id
      })
      navigation.reset({
        index: 1,
        routes: [
          {
            name: 'LicenseIndex'
          },
          {
            name: 'TrainingShow',
            params: {
              id: id
            }
          }
        ],
        key: null
      })
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchTraining()
  }, [])

  return (
    <>
      <WsStateFormView
        navigation={navigation}
        initValue={modelData}
        fields={fields}
        onSubmit={$event => {
          $_onSubmit($event)
        }}
      />
    </>
  )
}

export default TrainingUpdate

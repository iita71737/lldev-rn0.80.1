import React, { useState } from 'react'
import S_FeedBack from '@/services/api/v1/feedback'
import { WsStateFormView } from '@/components'
import { useSelector } from 'react-redux'
import i18next from 'i18next'

const FeedBack = ({ navigation }) => {
  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [fieldsValue, setFieldsValue] = React.useState()
  const fields = {
    contact_person: {
      label: '聯絡人姓名'
    },
    contact_way: {
      type: 'picker',
      label: i18next.t('聯絡方式'),
      rules: 'required',
      items: [
        { label: i18next.t('手機'), value: 'tel' },
        { label: 'Email', value: 'email' }
      ]
    },
    tel: {
      type: 'tel',
      label: i18next.t('手機號碼'),
      placeholder: i18next.t('請輸入手機號碼'),
      displayCheck(fieldsValue) {
        if (fieldsValue.contact_way == 'tel') {
          return true
        } else {
          return false
        }
      }
    },
    email: {
      type: 'email',
      label: 'Email',
      placeholder: i18next.t('請輸入信箱'),
      displayCheck(fieldsValue) {
        if (fieldsValue.contact_way == 'email') {
          return true
        } else {
          return false
        }
      }
    },
    remark: {
      label: '簡述'
    },
    attaches: {
      type: 'filesAndImages',
      label: t('上傳'),
      uploadUrl: `feedback/attach`
    }
  }

  // Function
  const $_onSubmit = async $event => {
    const _params = {
      user_paload: {
        id: currentUser.id,
        name: currentUser.name
      },
      contact_person: $event.contact_person,
      contact_way: $event.contact_way,
      tel: $event.tel,
      email: $event.email,
      remark: $event.remark,
      attaches: $event.attaches
    }
    if ($event.contact_way === 'tel') {
      delete _params.email
    }
    if ($event.contact_way === 'email') {
      delete _params.tel
    }
    const create = await S_FeedBack.create({ params: _params })
    navigation.navigate('Menu')
  }

  return (
    <>
      <WsStateFormView
        headerRightBtnText="送出"
        fields={fields}
        onChange={setFieldsValue}
        onSubmit={$_onSubmit}
      />
    </>
  )
}

export default FeedBack

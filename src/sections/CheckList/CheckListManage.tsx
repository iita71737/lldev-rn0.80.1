import React from 'react'
import CheckListFrequency from '@/sections/CheckList/CheckListFrequency'

interface CheckListManageProps {
  searchValue: string;
  type: string;
}

const CheckListManage: React.FC<CheckListManageProps> = props => {
  const { searchValue, type } = props

  return (
    <>
      <CheckListFrequency
        type={type}
        search={searchValue}
      >
      </CheckListFrequency>
    </>
  )
}

export default CheckListManage

import React, { useContext } from 'react'
import styled from 'styled-components'
import { useAragonApi } from '@aragon/api-react'

import { Button } from '@aragon/ui'

import { BoxContext } from '../wrappers/box'
import { Profile } from '../../modules/3box-aragon'
import {
  requestedProfileUnlock,
  profileUnlockSuccess,
  profileUnlockFailure,
  requestProfileEdit,
  savingProfile,
  savedProfile,
  saveProfileError,
} from '../stateManagers/box'
import { calculateChanged } from '../../modules/3box-LD'

const getButtonTitle = ({
  unlockedProfSuccess,
  loadedPublicProfSuccess,
  editingProfile,
}) => {
  if (editingProfile) return 'Save Profile'
  if (unlockedProfSuccess) return 'Edit Profile'
  if (loadedPublicProfSuccess) return 'Log In'
}

const AuthButton = () => {
  const { boxes, dispatch } = useContext(BoxContext)
  const { api, connectedAccount } = useAragonApi()

  const buttonDisabled = !boxes[connectedAccount]

  const unlockOrCreateProfile = async connectedAccount => {
    dispatch(requestedProfileUnlock(connectedAccount))
    try {
      const profile = new Profile(connectedAccount, api)
      await profile.unlockOrCreate()
      dispatch(profileUnlockSuccess(connectedAccount, profile))
    } catch (error) {
      dispatch(profileUnlockFailure(connectedAccount, error))
    }
  }

  const editProfile = connectedAccount =>
    dispatch(requestProfileEdit(connectedAccount))

  const saveProfile = async connectedAccount => {
    dispatch(savingProfile(connectedAccount))

    try {
      const { changed, forms, unlockedBox } = boxes[connectedAccount]

      const [changedFields, changedValues] = calculateChanged(changed, forms)
      await unlockedBox.setPublicFields(changedFields, changedValues)
      dispatch(savedProfile(connectedAccount, forms))
    } catch (error) {
      dispatch(saveProfileError(connectedAccount, error))
    }
  }

  const getButtonClickHandler = ({
    unlockedProfSuccess,
    loadedPublicProfSuccess,
    editingProfile,
  }) => {
    if (editingProfile) return saveProfile
    if (unlockedProfSuccess) return editProfile
    if (loadedPublicProfSuccess) return unlockOrCreateProfile
    return () => {
      throw new Error('Error thrown in the click handler, unmanaged state')
    }
  }

  const buttonTitle = buttonDisabled
    ? 'Log In'
    : getButtonTitle(boxes[connectedAccount])

  const buttonClickHandler = buttonDisabled
    ? () => {}
    : getButtonClickHandler(boxes[connectedAccount])

  return (
    <StyledButton
      disabled={buttonDisabled}
      mode="strong"
      onClick={() => buttonClickHandler(connectedAccount)}
    >
      {buttonTitle}
    </StyledButton>
  )
}

const StyledButton = styled(Button)`
  position: absolute;
  top: 10px;
  right: 30px;
  z-index: 2;
`

export default AuthButton

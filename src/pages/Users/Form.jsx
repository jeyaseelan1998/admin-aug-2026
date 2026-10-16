import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { formatDateTime } from '../../helpers/date'
import { compose, minLength, required } from '../../helpers/validators'

// The record carries a populated role; the API takes its id back.
const toValues = (user) => ({ ...user, role: user.role?.id })

// Only shown, never sent: the confirmation guards against typos, and the
// activity fields belong to the API.
const CLIENT_ONLY = ['confirmPassword', 'status', 'lastLoginAt', 'lastSeenAt']

const toPayload = (values) => {
  const payload = { ...values }

  for (const key of CLIENT_ONLY) delete payload[key]

  return payload
}

// Needed whenever a password is being set: always on create, on edit only
// once a new password has been typed.
const confirmsPassword = (value, values) => {
  if (!values.password && !value) return undefined
  if (!value) return 'Please confirm the password'

  return value === values.password ? undefined : 'Passwords do not match'
}

// No role picked means "leave it to the API": `user` on create, unchanged on edit.
const parseRole = (value) => value || undefined

export default function UserForm({ mode = 'create' }) {
  const isCreate = mode === 'create'

  return (
    <ResourceForm
      mode={mode}
      title="User"
      basePath="/users"
      url="/users"
      resource="user"
      toValues={toValues}
      toPayload={toPayload}
    >
      {({ isView }) => (
        <>
          <Field
            name="name"
            label="Name"
            disabled={isView}
            validate={required('Name is required')}
          />
          <Field
            name="email"
            label="Email"
            type="email"
            disabled={isView}
            validate={required('Email is required')}
          />
          <Field
            name="role"
            label="Role"
            url="/roles"
            placeholder={isCreate ? 'User (default)' : 'Select a role'}
            parse={parseRole}
            disabled={isView}
          />
          {isView && (
            <>
              <Field
                name="status"
                label="Status"
                format={(value) => (value === 'online' ? 'Online' : 'Offline')}
                disabled
              />
              <Field name="lastLoginAt" label="Last sign-in" format={formatDateTime} disabled />
              <Field name="lastSeenAt" label="Last seen" format={formatDateTime} disabled />
            </>
          )}
          {!isView && (
            <Field
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              // Only a new account must have one; on edit, blank keeps the current password.
              placeholder={isCreate ? undefined : 'Leave blank to keep the current password'}
              validate={
                isCreate
                  ? compose(required('Password is required'), minLength(8))
                  : minLength(8)
              }
              required={isCreate}
            />
          )}
          {!isView && (
            <Field
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              validate={confirmsPassword}
              required={isCreate}
            />
          )}
        </>
      )}
    </ResourceForm>
  )
}

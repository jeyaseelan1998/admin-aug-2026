import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { compose, minLength, required } from '../../helpers/validators'

// The record carries a populated role; the API takes its id back.
const toValues = (user) => ({ ...user, role: user.role?.id })

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
        </>
      )}
    </ResourceForm>
  )
}

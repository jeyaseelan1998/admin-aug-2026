import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

export default function SizeForm({ mode }) {
  return (
    <ResourceForm mode={mode} title="Size" basePath="/sizes" url="/size" resource="size">
      {({ isView }) => (
        <Field name="name" label="Name" disabled={isView} validate={required('Name is required')} />
      )}
    </ResourceForm>
  )
}

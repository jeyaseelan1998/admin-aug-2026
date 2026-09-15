import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

export default function CategoryForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Category"
      basePath="/categories"
      url="/category"
      resource="category"
    >
      {({ isView }) => (
        <Field name="name" label="Name" disabled={isView} validate={required('Name is required')} />
      )}
    </ResourceForm>
  )
}

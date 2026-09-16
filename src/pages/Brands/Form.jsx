import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

// The record carries populated media; the API takes its id back.
const toValues = (brand) => ({ ...brand, image: brand.image?.id ?? null })

export default function BrandForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Brand"
      basePath="/brands"
      url="/brand"
      resource="brand"
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
          <Field name="image" label="Image" type="image" disabled={isView} />
        </>
      )}
    </ResourceForm>
  )
}

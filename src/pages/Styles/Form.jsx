import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

// The record carries populated media; the API takes its id back.
const toValues = (style) => ({ ...style, image: style.image?.id ?? null })

const parseMedia = (value) => value || null

export default function StyleForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Style"
      basePath="/styles"
      url="/style"
      resource="style"
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
          <Field name="image" label="Image" placeholder="Media id" disabled={isView} parse={parseMedia} />
        </>
      )}
    </ResourceForm>
  )
}

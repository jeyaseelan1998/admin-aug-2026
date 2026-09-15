import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

const formatKeywords = (value) => (Array.isArray(value) ? value.join(', ') : value || '')

const parseKeywords = (value) =>
  value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)

export default function ColorForm({ mode }) {
  return (
    <ResourceForm mode={mode} title="Color" basePath="/colors" url="/color" resource="color">
      {({ isView }) => (
        <>
          <Field
            name="name"
            label="Name"
            disabled={isView}
            validate={required('Name is required')}
          />
          <Field
            name="code"
            label="Code"
            placeholder="#ff8800"
            disabled={isView}
            validate={required('Code is required')}
          />
          <Field
            name="keywords"
            label="Keywords"
            placeholder="red, crimson"
            disabled={isView}
            format={formatKeywords}
            parse={parseKeywords}
          />
        </>
      )}
    </ResourceForm>
  )
}

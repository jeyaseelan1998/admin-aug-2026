import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

// The record carries populated media; the API takes its id back.
const toValues = (social) => ({ ...social, image: social.image?.id ?? null })

const parseMedia = (value) => value || null

export default function SocialForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Social"
      basePath="/socials"
      url="/social"
      resource="social"
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
            name="link"
            label="Link"
            placeholder="https://"
            disabled={isView}
            validate={required('Link is required')}
          />
          <Field name="image" label="Image" placeholder="Media id" disabled={isView} parse={parseMedia} />
        </>
      )}
    </ResourceForm>
  )
}

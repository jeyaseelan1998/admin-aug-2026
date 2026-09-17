import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

// Icon names, not uploads: the storefront resolves these against its own icon
// set, so the list is fixed and the value travels as a plain string.
const ICONS = [
  'x',
  'facebook',
  'instagram',
  'threads',
  'linkedin',
  'youtube',
  'tiktok',
  'github',
  'discord',
  'reddit',
  'pinterest',
  'snapchat',
  'whatsapp',
  'telegram',
  'dribbble',
  'behance',
  'medium',
  'twitch',
].map((icon) => ({ value: icon, label: icon.charAt(0).toUpperCase() + icon.slice(1) }))

// A color reads better by name than by hex, with the code alongside it.
const toColorOptions = (data) =>
  (data.items || []).map((color) => ({ value: color.id, label: `${color.name} (${color.code})` }))

// The record carries a populated color; the API takes its id back.
const toValues = (social) => ({ ...social, background: social.background?.id ?? null })

// An unset background travels as null, which the API allows; '' is not an id.
const parseBackground = (value) => value || null

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
          <Field
            name="icon"
            label="Icon"
            options={ICONS}
            placeholder="Select an icon"
            disabled={isView}
            validate={required('Icon is required')}
          />
          <Field
            name="background"
            label="Background"
            url="/color"
            parseOptions={toColorOptions}
            placeholder="No background"
            parse={parseBackground}
            disabled={isView}
          />
        </>
      )}
    </ResourceForm>
  )
}

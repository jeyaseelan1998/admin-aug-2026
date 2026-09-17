import { Form as BsForm } from 'react-bootstrap'
import { Field as FinalField } from 'react-final-form'
import Dropdown from './Dropdown'
import FileInput from './File'
import { compose, number } from '../../../helpers/validators'

// A number is typed into a text input, so the value is checked rather than the
// browser's spinner enforcing it. `inputMode` still brings up a numeric keypad.
const isNumeric = (type) => type === 'number'

export default function Field({
  name,
  label,
  type = 'text',
  validate,
  format,
  parse,
  options,
  url,
  params,
  parseOptions,
  multiple,
  placeholder,
  required,
  ...props
}) {
  const isDropdown = Boolean(options || url)
  const numeric = isNumeric(type)
  // `image` is the same control with a picture-shaped default for `accept`.
  const isFile = type === 'file' || type === 'image'

  // `required()` tags itself, so a field marks its own label.
  const isRequired = required ?? Boolean(validate?.required)

  return (
    <FinalField
      name={name}
      // A select reports its own type through the event; forcing one breaks multiples.
      type={isDropdown || numeric || isFile ? undefined : type}
      validate={numeric ? compose(number(), validate) : validate}
      format={format}
      parse={parse}
    >
      {({ input, meta }) => (
        <BsForm.Group className="mb-3" controlId={name}>
          <BsForm.Label>
            {label}
            {isRequired && <span className="text-danger ms-1">*</span>}
          </BsForm.Label>

          {isFile ? (
            <FileInput
              input={input}
              meta={meta}
              placeholder={placeholder ?? (type === 'image' ? 'Upload an image' : undefined)}
              accept={type === 'image' ? 'image/*' : undefined}
              multiple={multiple}
              {...props}
            />
          ) : isDropdown ? (
            <Dropdown
              input={input}
              meta={meta}
              options={options}
              url={url}
              params={params}
              parseOptions={parseOptions}
              multiple={multiple}
              placeholder={placeholder}
              {...props}
            />
          ) : (
            <BsForm.Control
              {...input}
              type={numeric ? 'text' : type}
              inputMode={numeric ? 'decimal' : undefined}
              placeholder={placeholder}
              {...props}
              isInvalid={meta.touched && !!meta.error}
            />
          )}

          <BsForm.Control.Feedback type="invalid">{meta.error}</BsForm.Control.Feedback>
        </BsForm.Group>
      )}
    </FinalField>
  )
}

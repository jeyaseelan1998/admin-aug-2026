import { Form as BsForm } from 'react-bootstrap'
import { Field as FinalField } from 'react-final-form'
import Dropdown from './Dropdown'

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

  // `required()` tags itself, so a field marks its own label.
  const isRequired = required ?? Boolean(validate?.required)

  return (
    <FinalField
      name={name}
      // A select reports its own type through the event; forcing one breaks multiples.
      type={isDropdown ? undefined : type}
      validate={validate}
      format={format}
      parse={parse}
    >
      {({ input, meta }) => (
        <BsForm.Group className="mb-3" controlId={name}>
          <BsForm.Label>
            {label}
            {isRequired && <span className="text-danger ms-1">*</span>}
          </BsForm.Label>

          {isDropdown ? (
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

import { Form as BsForm } from 'react-bootstrap'
import { Field as FinalField } from 'react-final-form'

export default function Field({ name, label, type = 'text', validate, ...props }) {
  return (
    <FinalField name={name} type={type} validate={validate}>
      {({ input, meta }) => (
        <BsForm.Group className="mb-3" controlId={name}>
          <BsForm.Label>{label}</BsForm.Label>
          <BsForm.Control
            {...input}
            {...props}
            isInvalid={meta.touched && !!meta.error}
          />
          <BsForm.Control.Feedback type="invalid">
            {meta.error}
          </BsForm.Control.Feedback>
        </BsForm.Group>
      )}
    </FinalField>
  )
}

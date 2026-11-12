import Field from '../../../Components/Form/Field'
import { required } from '../../../helpers/validators'

const LIST_TYPES = [
  { value: 'new_arrivals', label: 'New arrivals' },
  { value: 'top_selling', label: 'Top selling' },
]

/** The products list widget's own fields, under the row name the repeater hands down. */
export default function ProductsFields({ name, disabled }) {
  return (
    <>
      <Field
        name={`${name}.title`}
        label="Title"
        placeholder="New Arrivals"
        disabled={disabled}
        validate={required('Title is required')}
      />
      <Field
        name={`${name}.listType`}
        label="List type"
        options={LIST_TYPES}
        placeholder="Select a list"
        disabled={disabled}
        validate={required('List type is required')}
      />
    </>
  )
}

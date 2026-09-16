import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

// The field holds text, so the digits stay exactly as typed -- '1.50' survives,
// where coercing each keystroke would swallow the trailing zero. An empty field
// drops out of the payload entirely, since the API rejects '' for a number.
const parseNumber = (value) => (value === '' ? undefined : value)

export default function PromoCodeForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Promo Code"
      basePath="/promo-codes"
      url="/promo-code"
      resource="promoCode"
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
            name="discount"
            label="Discount (%)"
            type="number"
            min="0"
            max="100"
            step="any"
            disabled={isView}
            parse={parseNumber}
            validate={required('Discount is required')}
          />
        </>
      )}
    </ResourceForm>
  )
}

import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

const parseNumber = (value) => (value === '' ? undefined : Number(value))

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

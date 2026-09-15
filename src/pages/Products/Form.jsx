import Field from '../../Components/Form/Field'
import ResourceForm from '../../Components/ResourceForm'
import { required } from '../../helpers/validators'

const parseNumber = (value) => (value === '' ? undefined : Number(value))

const parseMedia = (value) => value || null

const formatIds = (value) => (Array.isArray(value) ? value.join(', ') : value || '')

const parseIds = (value) =>
  value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

// Relations come back populated; the API takes ids. faq and stock are not edited here,
// but they still have to travel in their input shape so an update leaves them intact.
const toValues = (product) => ({
  ...product,
  thumbnail: product.thumbnail?.id ?? null,
  images: (product.images || []).map((image) => image.id),
  brand: product.brand?.id ?? null,
  category: (product.category || []).map((item) => item.id),
  color: (product.color || []).map((item) => item.id),
  style: (product.style || []).map((item) => item.id),
  faq: (product.faq || []).map(({ question, answer }) => ({ question, answer })),
  stock: (product.stock || []).map(({ stock, size }) => ({ stock, size: size?.id })),
})

export default function ProductForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Product"
      basePath="/products"
      url="/product"
      resource="product"
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
            name="thumbnail"
            label="Thumbnail"
            placeholder="Media id"
            disabled={isView}
            parse={parseMedia}
            validate={required('Thumbnail is required')}
          />
          <Field
            name="images"
            label="Images"
            placeholder="Media ids, comma separated"
            disabled={isView}
            format={formatIds}
            parse={parseIds}
          />

          <Field name="brand" label="Brand" url="/brand" disabled={isView} />
          <Field name="category" label="Categories" url="/category" multiple disabled={isView} />
          <Field name="color" label="Colors" url="/color" multiple disabled={isView} />
          <Field name="style" label="Styles" url="/style" multiple disabled={isView} />

          <Field
            name="price"
            label="Price"
            type="number"
            min="0"
            step="any"
            disabled={isView}
            parse={parseNumber}
            validate={required('Price is required')}
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
          />
          <Field
            name="rating"
            label="Rating"
            type="number"
            min="0"
            max="5"
            step="any"
            disabled={isView}
            parse={parseNumber}
          />
          <Field
            name="shipping"
            label="Shipping"
            type="number"
            min="0"
            step="any"
            disabled={isView}
            parse={parseNumber}
          />
          <Field
            name="minUnit"
            label="Min unit"
            type="number"
            min="0"
            step="1"
            disabled={isView}
            parse={parseNumber}
          />
          <Field
            name="maxUnit"
            label="Max unit"
            type="number"
            min="0"
            step="1"
            disabled={isView}
            parse={parseNumber}
          />

          <Field
            name="description"
            label="Description"
            as="textarea"
            rows={3}
            disabled={isView}
          />
          <Field name="details" label="Details" as="textarea" rows={5} disabled={isView} />
        </>
      )}
    </ResourceForm>
  )
}

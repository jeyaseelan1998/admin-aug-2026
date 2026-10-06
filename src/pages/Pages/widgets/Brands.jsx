import Field from '../../../Components/Form/Field'

/** The brands widget's own fields, under the row name the repeater hands down. */
export default function BrandsFields({ name, disabled }) {
  return <Field name={`${name}.brands`} label="Brands" url="/brand" multiple disabled={disabled} />
}

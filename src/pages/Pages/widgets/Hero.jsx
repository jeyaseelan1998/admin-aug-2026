import { Col, Row } from 'react-bootstrap'
import Field from '../../../Components/Form/Field'
import Repeater from '../../../Components/Form/Repeater'
import { required } from '../../../helpers/validators'

// Blank text is dropped rather than sent as '': the API takes null or nothing.
const optional = (value) => value || undefined

/** The hero banner's own fields, under the row name the repeater hands down. */
export default function HeroFields({ name, disabled }) {
  return (
    <>
      <Field
        name={`${name}.title`}
        label="Title"
        disabled={disabled}
        validate={required('Title is required')}
      />
      <Field
        name={`${name}.text`}
        label="Text"
        as="textarea"
        rows={3}
        parse={optional}
        disabled={disabled}
      />
      <Field
        name={`${name}.image`}
        label="Image"
        type="image"
        disabled={disabled}
        validate={required('Image is required')}
      />

      <Repeater
        name={`${name}.stats`}
        label="Stats"
        help="The figures shown beside the banner."
        addLabel="Add stat"
        blank={{ unit: '', label: '' }}
        disabled={disabled}
        empty="No stats."
        rowLabel={(stat, index) => stat.label || `Stat ${index + 1}`}
        renderItem={({ name: stat }) => (
          <Row>
            <Col md={4}>
              <Field
                name={`${stat}.unit`}
                label="Unit"
                type="number"
                placeholder="200"
                disabled={disabled}
                validate={required('Unit is required')}
              />
            </Col>
            <Col md={8}>
              <Field
                name={`${stat}.label`}
                label="Label"
                placeholder="International Brands"
                disabled={disabled}
                validate={required('Label is required')}
              />
            </Col>
          </Row>
        )}
      />
    </>
  )
}

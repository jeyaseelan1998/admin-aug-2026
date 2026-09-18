import { useState } from 'react'
import { Button } from 'react-bootstrap'
import Field from '../../Components/Form/Field'
import Repeater from '../../Components/Form/Repeater'
import Picker from '../../Components/Picker'
import ResourceForm from '../../Components/ResourceForm'
import { FiPlus } from '../../Components/Icons'
import { required } from '../../helpers/validators'
import { WIDGETS, widgetOf } from './widgets'

const STATUS = [
  { value: 0, label: 'Draft' },
  { value: 1, label: 'Published' },
]

// A select hands back the option's text, and the API takes 0 or 1.
const parseStatus = (value) => (value === '' || value == null ? undefined : Number(value))

// Blank text is dropped rather than sent as '': the API takes null or nothing.
const optional = (value) => value || undefined

const omit = (record, keys) => {
  const values = { ...record }

  for (const key of keys) delete values[key]

  return values
}

// A widget arrives with its media populated and with the ids the API minted for
// the subdocuments; it goes back as media ids, and the API mints those ids anew.
const toWidget = (widget) => {
  const values = omit(widget, ['_id'])

  if (values.image) values.image = values.image.id ?? values.image
  if (values.stats) values.stats = values.stats.map((stat) => omit(stat, ['_id']))

  return values
}

const toValues = (page) => ({ ...page, widgets: (page.widgets || []).map(toWidget) })

function Widgets({ disabled }) {
  const [picking, setPicking] = useState(false)

  return (
    <Repeater
      name="widgets"
      label="Widgets"
      help="Rendered top to bottom in this order."
      disabled={disabled}
      empty="No widgets on this page yet."
      rowLabel={(widget, index) => `${index + 1}. ${widgetOf(widget.type)?.label ?? widget.type}`}
      renderItem={({ name, value }) => {
        const widget = widgetOf(value?.type)

        // A page may hold a type this build has no editor for; its fields are
        // left alone rather than dropped on the next save.
        return widget ? (
          <widget.Fields name={name} disabled={disabled} />
        ) : (
          <p className="small text-muted mb-0">
            No editor for “{value?.type}”. Saving keeps it as it is.
          </p>
        )
      }}
      renderAdd={({ push }) => (
        <>
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => setPicking(true)}
          >
            <FiPlus />
            Add widget
          </Button>

          {picking && (
            <Picker
              title="Add a widget"
              options={WIDGETS}
              saveLabel="Add"
              onClose={() => setPicking(false)}
              onSave={([chosen]) => {
                push(chosen.blank())
                setPicking(false)
              }}
            />
          )}
        </>
      )}
    />
  )
}

export default function PageForm({ mode }) {
  return (
    <ResourceForm
      mode={mode}
      title="Page"
      basePath="/pages"
      url="/page"
      resource="page"
      toValues={toValues}
    >
      {({ isView }) => (
        <>
          <Field
            name="title"
            label="Title"
            disabled={isView}
            validate={required('Title is required')}
          />
          <Field
            name="slug"
            label="Slug"
            placeholder="about-us"
            disabled={isView}
            validate={required('Slug is required')}
          />
          <Field
            name="status"
            label="Status"
            options={STATUS}
            placeholder="Draft"
            parse={parseStatus}
            disabled={isView}
          />
          <Field
            name="metaTitle"
            label="Meta title"
            parse={optional}
            disabled={isView}
          />
          <Field
            name="metaDescription"
            label="Meta description"
            as="textarea"
            rows={2}
            parse={optional}
            disabled={isView}
          />

          <Widgets disabled={isView} />
        </>
      )}
    </ResourceForm>
  )
}

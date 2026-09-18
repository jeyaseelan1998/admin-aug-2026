import HeroFields from './Hero'

// A wireframe of the layout, so the picker shows the shape of a widget rather
// than only its name. Inline, so a widget type stays one entry in this file.
const preview = (body) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#e9ecef"/>${body}</svg>`
  )}`

const HERO_PREVIEW = preview(
  '<rect x="12" y="20" width="70" height="9" rx="2" fill="#adb5bd"/>' +
    '<rect x="12" y="35" width="54" height="5" rx="2" fill="#ced4da"/>' +
    '<rect x="12" y="44" width="44" height="5" rx="2" fill="#ced4da"/>' +
    '<rect x="12" y="57" width="32" height="11" rx="3" fill="#6c757d"/>' +
    '<rect x="96" y="16" width="52" height="58" rx="4" fill="#ced4da"/>'
)

/**
 * The widget types the CMS offers, in the order the picker lists them. The API
 * takes whatever shape `type` names, so a new type is one more entry here:
 * `blank` is the row the repeater starts from, `Fields` edits it, and
 * `image`/`text` are what the picker shows -- both optional.
 */
export const WIDGETS = [
  {
    value: 'hero',
    label: 'Hero',
    text: 'Full-width banner: heading, image, an optional button and stats.',
    image: HERO_PREVIEW,
    blank: () => ({ type: 'hero', title: '', stats: [] }),
    Fields: HeroFields,
  },
]

export const widgetOf = (type) => WIDGETS.find((widget) => widget.value === type)

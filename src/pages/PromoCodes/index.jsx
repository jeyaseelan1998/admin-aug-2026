import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'discount', label: 'Discount' },
]

export default function PromoCodes() {
  return (
    <List
      title="Promo Codes"
      basePath="/promo-codes"
      url="/promo-code"
      columns={columns}
      empty="No promo codes yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE']}
    />
  )
}

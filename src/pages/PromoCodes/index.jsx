import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'discount', label: 'Discount' },
]

export default function PromoCodes() {
  return <List title="Promo Codes" url="/promo-code" columns={columns} empty="No promo codes yet." />
}

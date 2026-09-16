import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'brand.name', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'discount', label: 'Discount' },
  { key: 'rating', label: 'Rating' },
]

export default function Products() {
  return (
    <List
      title="Products"
      basePath="/products"
      url="/product"
      columns={columns}
      empty="No products yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE', 'RESTORE', 'TRASH']}
    />
  )
}

import { Card, Tab, Tabs } from 'react-bootstrap'
import { useParams, useSearchParams } from 'react-router-dom'
import UserForm from './Form'
import LoginHistory from './LoginHistory'

const TABS = ['details', 'history']

// The tab lives in the url (?tab=history), so it survives a reload and the
// users list can link straight to the login history.
export default function UserView() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const requested = searchParams.get('tab')
  const activeTab = TABS.includes(requested) ? requested : 'details'

  const selectTab = (tab) =>
    setSearchParams(tab === 'details' ? {} : { tab }, { replace: true })

  return (
    // mountOnEnter: the history is only requested once its tab is opened.
    <Tabs activeKey={activeTab} onSelect={selectTab} mountOnEnter className="mb-3">
      <Tab eventKey="details" title="Details">
        <UserForm mode="view" />
      </Tab>
      <Tab eventKey="history" title="Login history">
        <Card>
          <Card.Body className="p-4">
            <LoginHistory userId={id} />
          </Card.Body>
        </Card>
      </Tab>
    </Tabs>
  )
}

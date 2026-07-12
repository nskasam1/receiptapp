import { useReceiptStore } from './store/useReceiptStore'
import { ScanStep } from './components/steps/ScanStep'
import { PeopleStep } from './components/steps/PeopleStep'
import { ItemsStep } from './components/steps/ItemsStep'
import { AssignStep } from './components/steps/AssignStep'
import { TaxTipStep } from './components/steps/TaxTipStep'
import { SummaryStep } from './components/steps/SummaryStep'
import { ShareStep } from './components/steps/ShareStep'

function App() {
  const step = useReceiptStore((s) => s.step)

  switch (step) {
    case 'scan':
      return <ScanStep />
    case 'people':
      return <PeopleStep />
    case 'items':
      return <ItemsStep />
    case 'assign':
      return <AssignStep />
    case 'taxtip':
      return <TaxTipStep />
    case 'summary':
      return <SummaryStep />
    case 'share':
      return <ShareStep />
  }
}

export default App

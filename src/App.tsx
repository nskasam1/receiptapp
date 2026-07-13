import { useRef } from 'react'
import { useReceiptStore } from './store/useReceiptStore'
import { STEPS } from './lib/types'
import { NavigationDirectionContext, type NavigationDirection } from './lib/navigationDirection'
import { LoginStep } from './components/steps/LoginStep'
import { ScanStep } from './components/steps/ScanStep'
import { PeopleStep } from './components/steps/PeopleStep'
import { ItemsStep } from './components/steps/ItemsStep'
import { AssignStep } from './components/steps/AssignStep'
import { TaxTipStep } from './components/steps/TaxTipStep'
import { SummaryStep } from './components/steps/SummaryStep'
import { ShareStep } from './components/steps/ShareStep'

function App() {
  const step = useReceiptStore((s) => s.step)

  const currentIndex = STEPS.indexOf(step)
  const prevIndexRef = useRef(currentIndex)
  const direction: NavigationDirection = currentIndex < prevIndexRef.current ? 'back' : 'forward'
  prevIndexRef.current = currentIndex

  let content: React.ReactNode
  switch (step) {
    case 'login':
      content = <LoginStep />
      break
    case 'scan':
      content = <ScanStep />
      break
    case 'people':
      content = <PeopleStep />
      break
    case 'items':
      content = <ItemsStep />
      break
    case 'assign':
      content = <AssignStep />
      break
    case 'taxtip':
      content = <TaxTipStep />
      break
    case 'summary':
      content = <SummaryStep />
      break
    case 'share':
      content = <ShareStep />
      break
  }

  return <NavigationDirectionContext.Provider value={direction}>{content}</NavigationDirectionContext.Provider>
}

export default App

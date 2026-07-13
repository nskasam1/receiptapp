import { createContext, useContext } from 'react'

export type NavigationDirection = 'forward' | 'back'

export const NavigationDirectionContext = createContext<NavigationDirection>('forward')

export function useNavigationDirection(): NavigationDirection {
  return useContext(NavigationDirectionContext)
}

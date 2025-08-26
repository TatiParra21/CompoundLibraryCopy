import { useEffect, useRef} from "react"
import type {EffectCallback, DependencyList } from "react"
const useOnlyOnFirstRender = (
  effectFunction: EffectCallback =()=>{}, deps: DependencyList ): void => {
  const hasRun = useRef(false)

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true
      effectFunction()
    }
      
    
  }, [])
}

export default useOnlyOnFirstRender
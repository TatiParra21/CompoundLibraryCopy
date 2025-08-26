
import { useState } from "react"
import useOnlyOnFirstRender from "./useOnlyOnFirstRender"
const useToggle =(initialValue:boolean =false,startFunc:()=>void = ()=>{}): [boolean,()=>void ]=>{

    const [open, setOpen]  = useState(initialValue)

    const toggle=()=>{
        setOpen(prevOpen => !prevOpen)
    }
    useOnlyOnFirstRender(startFunc,[open])
    return [open, toggle]

}



export default useToggle
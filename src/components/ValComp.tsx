import React from "react"
import { useRef } from "react"
import type { ComponentStyleType } from "./types"
import { type ColorDataStoreType, colorDataStore } from "../store/projectStore"
type ReactComponents ={
    children:React.ReactNode
   
    mainStyle: ComponentStyleType
    className: string
}
export const ValComp=({children, mainStyle, className}:ReactComponents)=>{
  const { copyHex, setIsDisabled} : ColorDataStoreType= colorDataStore(state=>state)
    const refValue = useRef<HTMLInputElement>(null)
    const onCopy =()=>{
        const hexValue = refValue.current?.innerText
        if(hexValue){
             navigator.clipboard.writeText(hexValue)
             console.log("copied", hexValue)
             
            copyHex( hexValue)
            setIsDisabled(false)
        

        }
       
    }

    return(<>
    <span onClick={onCopy}>Copy to Search</span>
    <p  className={className} ref={refValue} style={{...mainStyle, cursor: "pointer", userSelect: "none" }}>
        {children}

    </p>
    </>
    
    )
}
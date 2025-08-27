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
            copyHex( hexValue)
            setIsDisabled(false)
        }
    }
    return(
    <>
        <span style={{cursor: "pointer", userSelect: "none" }} onClick={onCopy}>Copy to Search</span>
        <p  className={className} ref={refValue} style={{...mainStyle, }}>
        {children}
        </p>
    </>
    )
}
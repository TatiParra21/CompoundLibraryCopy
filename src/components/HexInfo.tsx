import type { JSX} from "react"
import type { ColorPickerProps } from "./ColorPicker"
import { type HexSizeStoreType, hexSizeStore } from "../store/projectStore"

export const HexInfo =({children}:ColorPickerProps):JSX.Element=>{
    const {textType, setTextType}: HexSizeStoreType = hexSizeStore(state=>state)
    const oppositeTextType = textType == "Normal" ? "Large" : "Normal"
    
    return(
        <>
            <div className="foreground-sec">
                 <h3>{` Currently Measuring ${textType} text size.`}</h3>
                <button  onClick={()=>{setTextType(oppositeTextType)}}>{`Switch to ${oppositeTextType} Text?`}</button>
            </div> 
            {children}
        </>  
    )
}
import type {  ComponentType, ColorSchemeType } from "../components/types"
import { useRef } from "react"
import { type HexSizeStoreType, hexSizeStore, type ColorDataStoreType, colorDataStore } from "../store/projectStore"
import { saveColorSchemeForUser, type SavedUserColorSchemeType } from "../functions/requestFunctions"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"
const ColorDataInfoComp =({contrast_ratio, aatext, aaatext}:{contrast_ratio:string|number, aatext:boolean, aaatext:boolean})=>{
  return(
    <>
      <p>{`Ratio: ${contrast_ratio ?? "no ratio yet"}`}</p>
      <p>{`AA Text: ${aatext}`}</p>
      <p>{`AAA Text: ${aaatext}`}</p>
    </>
  )
}

export const ComponentBase =({ variant,colorName, mainStyle, className}: ComponentType)=>{
   
    const copyHex = colorDataStore(state=>state.copyHex)
    const setIsDisabled = colorDataStore(state=>state.setIsDisabled)
    const baseColor = colorDataStore(state=>state.allInfo?.mainColor)
    if(!baseColor)throw new Error("Basecolornot in")
    console.log(baseColor,  "base")
    const navigate = useNavigate()
    const refValue = useRef<HTMLInputElement>(null)
    const onCopy =()=>{
        const hexValue = refValue.current?.innerText
        if(hexValue){
             navigator.clipboard.writeText(hexValue)
            copyHex( hexValue)
            setIsDisabled(false)
        }
    }
    const redirectOrSave=async()=>{
      try{
         const {data, error} = await supabase.auth.getSession()
          if(error)throw new Error(error.message)
            console.log(data.session)
          if(!data.session) navigate("/sign-in",{state:{fromFeature:"save"}})
            else if(data.session.user.id){
          const hexPairs: [string, string][] = [
              [baseColor.hex, baseColor.name],
              [variant.hex, variant.name]
              ];
              hexPairs.sort((a,b)=>a[0].localeCompare(b[0]))
            const [[hex1,hex1name],[hex2,hex2name]] = hexPairs
          const savedSchemeInfo : SavedUserColorSchemeType ={
            user_id: data.session.user.id,
            scheme_name:"",
            hex1:hex1,
            hex1name:hex1name,
            hex2:hex2,
            hex2name:hex2name,
            contrast_ratio: Number(variant.contrast_ratio), 
            aatext:variant.aatext, 
            aaatext:variant.aaatext

          }
          await saveColorSchemeForUser(savedSchemeInfo)
          }

      }catch(err){
        console.error(err)

      }
     
    

}
   const {textType}:HexSizeStoreType = hexSizeStore(state=>state)
  const {aaatext,aatext,contrast_ratio} = variant
    return(
         <div className="badge-div">
            <h3>{colorName} </h3>  
              <p className={className} ref={refValue} style={{...mainStyle, }} > 
                  {` ${variant?.hex}`}
                </p>
                 <span style={{cursor: "pointer", userSelect: "none" }} onClick={onCopy}>Copy</span>
            <div className="color-desc flex-colum">
                {textType== "Normal" && <>
                 <ColorDataInfoComp contrast_ratio={contrast_ratio}  aatext={aatext} aaatext={aaatext}/>
                </>}
               {textType == "Large" && <>
                <ColorDataInfoComp contrast_ratio={contrast_ratio}  aatext={Number(contrast_ratio) > 3} aaatext={Number(contrast_ratio) > 4.5}/>
               </>}
               <button onClick={redirectOrSave}>Save ColorScheme</button>
            </div>     
        </div>
    )
}
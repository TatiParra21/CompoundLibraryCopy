import type {  ComponentType } from "../components/types"
import { useRef } from "react"
import { type HexSizeStoreType, hexSizeStore, type ColorDataStoreType, colorDataStore } from "../store/projectStore"
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
    const { copyHex, setIsDisabled} : ColorDataStoreType= colorDataStore(state=>state)
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
    const redirectToSignIn =async()=>{
      try{
         const {data, error} = await supabase.auth.getSession()
          if(error)throw new Error(error.message)
            //console.log(data.session)
          if(!data.session) navigate("/sign-in",{state:{fromFeature:"save"}})

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
               <button onClick={redirectToSignIn}>Save ColorScheme</button>
            </div>     
        </div>
    )
}
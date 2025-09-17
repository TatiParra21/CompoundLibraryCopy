import type {  ComponentType, ColorSchemeType } from "../components/types"
import { useRef } from "react"
import { type HexSizeStoreType, hexSizeStore, colorDataStore, authStateStore } from "../store/projectStore"
import { saveColorSchemeForUser, type SavedUserColorSchemeType } from "../functions/requestFunctions"
import { supabase } from "../supabaseClient"
import {type UserSchemesData } from "../store/projectStore"
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
    const setUserSchemes = authStateStore(state=>state.setUserSchemes)
    const userSchemes = authStateStore(state=>state.userSchemes)
    if(!baseColor)throw new Error("Basecolornot in")
      const hexAndNamePairs: [string, string][] = [
              [baseColor.hex, baseColor.name],
              [variant.hex, variant.name]
              ];
              hexAndNamePairs.sort((a,b)=>a[0].localeCompare(b[0]))
            const [[hex1,hex1name],[hex2,hex2name]] = hexAndNamePairs
    const alreadyExists = userSchemes?.some(
        (scheme: UserSchemesData) =>
          (scheme.hex1 === hex1 && scheme.hex2 === hex2) ||
          (scheme.hex1 === hex2 && scheme.hex2 === hex1) // just in case order matters
      )
  
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
          if(!data.session) navigate("/sign-in",{state:{fromFeature:"save"}})
            else if(data.session.user.id){
          
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
               <button disabled={alreadyExists} onClick={redirectOrSave}>{ alreadyExists ? "Color already Saved": 
               "Save ColorScheme"}</button>
            </div>     
        </div>
    )
}

export const UserSchemeComponentBase =({ userScheme}: {userScheme:UserSchemesData})=>{
   
    const copyHex = colorDataStore(state=>state.copyHex)
    const setIsDisabled = colorDataStore(state=>state.setIsDisabled)
    const foreGroundRefValue = useRef<HTMLInputElement>(null)
    const backGroundRefValue = useRef<HTMLInputElement>(null)
    const onCopy =(ref:string)=>{
        const hexValue = ref == "foreground" ? foreGroundRefValue.current?.innerText : backGroundRefValue.current?.innerText
        if(hexValue){
             navigator.clipboard.writeText(hexValue)
            copyHex( hexValue)
            setIsDisabled(false)
        }
}
   const {textType}:HexSizeStoreType = hexSizeStore(state=>state)
  const {aaatext,aatext,contrast_ratio, hex1,hex2, hex1name, hex2name, scheme_name} = userScheme
  const foreGround = hex1
  const backGround = hex2
  console.log(foreGround)
   const foreGroundName = hex1name
  const backGroundName = hex2name
  const mainStyle ={
                color:`${foreGround}`,
                background: `${backGround}` ,          
  }
    return(
         <div className="badge-div">
            <h3>{scheme_name || `${foreGroundName} and ${backGroundName}`} </h3>  
               
              <p className="result-sec flex-colum" style={{...mainStyle, }} > 
                  {`Sample`}
                </p>
            <div className="foreground-sec">
                  <div className="color-div" style={{cursor: "pointer", userSelect: "none" }}>
                      <p >{` ${foreGroundName}`}</p>
                       <span ref={foreGroundRefValue} 
                       style={{color:foreGround }} 
                       onClick={()=>onCopy("foreground")}>{foreGround}</span>
                   </div>
                    
                  <div className="color-div" style={{cursor: "pointer", userSelect: "none" }}>
                     <p  
                     onClick={()=>onCopy("background")}>{` ${backGroundName}`}</p>
                    <span ref={backGroundRefValue}
                    style={{color:backGround, }} onClick={()=>onCopy("background")}>{backGround}</span>
                    
                  </div>
                   
            </div>
                
            <div className="color-desc flex-colum">
                {textType== "Normal" && <>
                 <ColorDataInfoComp contrast_ratio={contrast_ratio}  aatext={aatext} aaatext={aaatext}/>
                </>}
               {textType == "Large" && <>
                <ColorDataInfoComp contrast_ratio={contrast_ratio}  aatext={Number(contrast_ratio) > 3} aaatext={Number(contrast_ratio) > 4.5}/>
               </>}
              
            </div>     
        </div>
    )
}
import type {  ComponentType } from "../components/types"
import { ValComp } from "./ValComp"
import { type HexSizeStoreType, hexSizeStore } from "../store/projectStore"
export const ComponentBase =({ variant,colorName, mainStyle, className}: ComponentType)=>{
   const {textType}:HexSizeStoreType = hexSizeStore(state=>state)
  const {aaatext,aatext,contrast_ratio} = variant
    return(
         <div className="badge-div">
            <h3>{colorName} </h3>  
              <ValComp className={className} mainStyle={mainStyle} > 
                  {` ${variant?.hex}`}
                </ValComp>
            <div className="color-desc flex-colum">
                {textType== "Normal" && <>
                  <p>{`Ratio: ${contrast_ratio ?? "no ratio yet"}`}</p>
                  <p>{`AA Text: ${aatext}`}</p>
                  <p>{`AAA Text: ${aaatext}`}</p>
                </>}
               {textType == "Large" && <>
                  <p>{`Ratio: ${contrast_ratio ?? "no ratio yet"}`}</p>
                  <p>{`AA Text: ${Number(contrast_ratio) > 3}`}</p>
                  <p>{`AAA Text: ${Number(contrast_ratio) > 4.5}`}</p>
               </>}
            </div>     
        </div>
    )
}
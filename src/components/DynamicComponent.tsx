
import type {  ComponentBaseType } from "./types"

import { ComponentBase } from "./ComponentBase"
const DynamicComponent =({baseColor, variant,colorName, type}: ComponentBaseType)=>{
const mainStyle ={
                color:`${baseColor}`,
                background: `#${variant.clean_hex}` ,
                
  }
  return(<>
    <ComponentBase className={`${type}-style`} variant={variant} colorName={colorName} mainStyle={mainStyle}/> 
  </>
       
    )
}

export default DynamicComponent
import chroma from "chroma-js"

import { getColorDataAPI, getColorName } from "./fetchColorSchemes"

import type { ColorSchemeType, SameColorNameType, ColorType } from "../components/types"




export const testing =async(firstcolor:ColorType,baseColor:string, count:number ): Promise<ColorSchemeType[]>=>{
      try{ //#411F10    
             const { hex} = firstcolor
                    if(!hex){
                        throw Error
                    }
                     const whiteContrast = chroma.contrast(hex, "white");
                    const blackContrast = chroma.contrast(hex, "black");
                    
                        const contrastColor = whiteContrast > blackContrast ? "white" : "black"
                        //const mult = 0.5
                        const colorTest = chroma.scale([hex, contrastColor]).colors(count)
                       // console.log(colorTest, "tesss")
                        
                        // const sameName = new Set<string>()
                        // const filteringColors:string[] = await Promise.all(colorTest.filter(async col=>{
                        //     const base = await getColorName(col)
                        //     return base.closest_named_hex == closest
                        // }))
                    const arr  = await Promise.all (
                        
                            colorTest.map( async (col:string) : Promise<ColorSchemeType>=>{  
                                 const base = await getColorName(col)
                                 if(!base)throw new Error("colornmae not got")
                            const secondData =  getColorDataAPI(base,baseColor)
                             if(!secondData)throw new Error("secondata not got")
                           
                return secondData
                            })

                        )
                        //console.log({variants: arr,name:colorName, closest}, "FINAL")
                        return arr
            }
                catch(err){
                    if(err instanceof Error){
                        console.error(err)
                        throw new Error(err.message)

                    }else{
                        throw new Error("unknown error")
                    } 
            }
}
export default testing





export const generateColorShades =async(colorObj: ColorType,count: number, baseColor: string):Promise<SameColorNameType>=>{
    try{
        if(!colorObj)throw new Error("color object not provided")
   const {name, hex,closest_named_hex} = colorObj
    
        const colorShades: ColorSchemeType[] = await testing(colorObj,baseColor,count)
        if(!colorShades)throw new Error("testing failed")
        return {name,hex, closest: closest_named_hex ,variants: colorShades}
       // lastArr.push(colorShades)

    
   
   //console.log(lastArr, "over")
  //return lastArr
   
    }catch(err){
        if(err instanceof Error){
            throw new Error(err.message)
        }else{
            throw new Error("unknown error")
        }
    }
    
   
   
}

/* 




    const bestColors:{hexVal: string }[] = []
     let attempts = 0
     let multiple = 2
     
    while(bestColors.length < count){
        const maxTries = count* multiple
        
        if(bestColors.length >= count)break
        if(attempts > 100) break
        if(maxTries <= attempts && bestColors.length >= count)break
        if(maxTries <= attempts && bestColors.length < count){
            multiple++
        }
        const generatedCols = chromaFunc.colors(count * multiple)
    
       const contrast = chroma.contrast(baseColor, generatedCols[attempts]).toFixed(2)
       const currentColor = generatedCols[attempts]
         
             if(Number(contrast) > 3 && !bestColors.includes({hexVal:currentColor})){
                bestColors.push({hexVal: currentColor})

             }
             attempts++
    }
    
    return bestColors


*/

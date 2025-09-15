
import chroma from "chroma-js"
import { getColorDataAPI } from "./fetchColorSchemes"
import type { ColorType, ColorInfo, ColorSchemeTypeArr,ColorSchemeType } from "../components/types"
import { checkIfVariantInDB,checkIfContrastIn, type checkIfVariantInDBResult, handleSingleColor} from "./requestFunctions"
import { getColorName } from "./fetchColorSchemes"
import pLimit from 'p-limit';
const limit = pLimit(20);
const colorContrastCache : Map<ColorType, ColorSchemeType> = new Map<ColorType,ColorSchemeType>()
const getOrAddColor =async(hexVal: string):Promise<ColorType>=>{
    try{  
        const hexing : checkIfVariantInDBResult= await checkIfVariantInDB(hexVal)
        //console.log(hexing, "hexing res")
        let test:ColorType = hexing.found && hexing?.results  ? hexing.results[0] : await getColorName(hexVal)
        //if it isn't not only do we get it from the api but we also add it to the database
     
            if(!test)throw new Error("test failed failed to get info from API")    
        return test
    }catch(err){
         throw err
    } 
}
const colorCache : Map<string, ColorType> = new Map<string, ColorType>();
const getOrAddColorCatched =async(hex:string): Promise<ColorType>=>{
   //exclamation at the end tells typescript the value wont be null or undefined
    const result:ColorType = colorCache.has(hex) ? colorCache.get(hex)! :  await getOrAddColor(hex)
    colorCache.set(hex,result)
    return result
}
type UsedAndNamedHexManagerType = {
  update: (closest_named_hex: string, hex: string) => UsedAndNamedHexManagerType,
  //update performs the functiont put inside update and it also return the object it lives inside which allows method chaining
  getSets: () => { usedHexes: Set<string>, usedNamedHexes: Set<string> }
}
const addtoUsedAndNamedHexes =(usedHexes: Set<string>,usedNamedHexes: Set<string>):UsedAndNamedHexManagerType=>{
  const update= (closest_named_hex :string,hex: string)=>{
    usedNamedHexes.add(closest_named_hex)
     usedHexes.add(hex)    
        return updateAndReturn
      ///I assume updateAndReturn is blockScoper
  }
const updateAndReturn ={
  update,
  getSets: ()=>({usedHexes,usedNamedHexes})
}
return updateAndReturn
}
const colorContrastTest =async(baseColor:string,  manager: UsedAndNamedHexManagerType, uniqueHexesUpdated: ColorType[] ): Promise<ColorSchemeTypeArr>=>{
     try{
          const sets = manager.getSets()
          const passingHexes:ColorType[] = uniqueHexesUpdated.filter((hexObj: ColorType)=>{
            const {closest_named_hex: closest, hex} = hexObj
            //if a namedHex or hexvalue is already in a set they will be filtered out 
              if(sets.usedHexes.has(hex) || sets.usedNamedHexes.has(closest) || colorContrastCache.has(hexObj))return false
              const colorScheme = getColorDataAPI(hexObj, baseColor)
                 if(colorScheme) colorContrastCache.set(hexObj,colorScheme) 
                 manager.update(closest, hex)
              return true
            }
        ) 
        const colorSchemes :PromiseSettledResult<ColorSchemeType>[]= await Promise.allSettled(
            passingHexes.map(async(col:ColorType)=>{
                const colorScheme :ColorSchemeType = colorContrastCache.has(col) ? colorContrastCache.get(col)!: getColorDataAPI(col, baseColor)
                 if(colorScheme) colorContrastCache.set(col,colorScheme) 
                return colorScheme
            })
        )
        const successFullColors = colorSchemes.filter(color=> color.status == "fulfilled" ).map(col=>col.value)
        return successFullColors
     }catch(err){
        throw err
     }
}
const findContrastColors =(base: string, count: number)=>{
    const passingColors:string[] = []
    let half = count/2
    while(passingColors.length < count){
        const colors = ["white","black","blue","yellow","red","green","pink","purple","orange"]
        const randomGenerated = Array.from({length:half},()=>chroma.random().hex())
        const all = [...colors,...randomGenerated]
        all.forEach(col=>{
            if(chroma.contrast(base, col) > 3.5 && !passingColors.includes(col)){
                passingColors.push(col)
            }      
        }
    )
  }
 return passingColors.sort((a,b)=>{
   return Number(chroma.contrast(base, b))-Number(chroma.contrast(base, a))
 })
}


const getContrastingHexes =(baseColor:string, currentColor:string,count:number)=>{
     const chromaFunc = chroma.scale([baseColor,currentColor ]).colors(count)
        //gives us an array of random colors between the base color and the current contrast color
        //check constrast filters out colors that have a ratio less then 3 with the basecolor
        return chromaFunc.filter(hex=>chroma.contrast(baseColor,hex) > 3)
}
export const generateContrastingColors =async(baseColor: string, count: number=5,setLoadingProgress:(val:string)=>void,dbArr:ColorSchemeTypeArr|'' ='', ): Promise<ColorSchemeTypeArr>=>{

    const contrastColor = findContrastColors(baseColor, count)
    const bestColors:ColorSchemeTypeArr = []
    const allHexes = new Set<string>();
    const usedHexes = new Set<string>();
    const usedNamedHexes = new Set<string>();
 
    const manager :UsedAndNamedHexManagerType = addtoUsedAndNamedHexes(usedHexes,usedNamedHexes)
    if(dbArr && dbArr.length >0){
        dbArr.forEach(col=>{
            manager.update(col.closest_named_hex, col.hex)
        })
    }
    try{
    const maxTries = 50
    let attempts = 0
    let empty = 0
    let turn = 0
    const maxEmpty = 20
    let ranOut = false
    while(bestColors.length < count && attempts < maxTries && !ranOut){
        if(turn >= contrastColor.length) turn = 0
        ///current color it the current main color chosen
        const currentColor = contrastColor[turn]
        const contrastHexes = getContrastingHexes(baseColor,currentColor, count)
         contrastHexes.forEach(color=> allHexes.add(color))
        //in here the passing hexes are added to a set
         const uniqueHexes = [...allHexes]
          const results: PromiseSettledResult<ColorType>[] = await Promise.allSettled(
            uniqueHexes.map((hexVal: string) =>limit(()=>getOrAddColorCatched(hexVal))))
            const uniqueHexesUpdated = results.filter(color=>color.status =="fulfilled").map(col=>col.value)
        const filteredColors:ColorSchemeTypeArr = await colorContrastTest(baseColor,manager,uniqueHexesUpdated)
        if(filteredColors.length > 0){
            bestColors.push(...filteredColors)
        }else{ 
            empty++
            //console.log("current empty",empty)
            if(empty >=maxEmpty)ranOut = true
        }
       //console.log("current length",bestColors.length)
       setLoadingProgress(`${bestColors.length}`)

        attempts++
        turn++
    }
    }catch(err){
       throw err
    }finally{
          setLoadingProgress("0")
    }
    return bestColors.slice(0,count)
}
const getContrastsInDB =async(hex: string,count:number, setLoadingProgress:(val:string)=>void): Promise<ColorSchemeTypeArr>=>{
    try{     
                const storedContrasts= await checkIfContrastIn(hex)
                     let contrasts = !storedContrasts.results ? await generateContrastingColors(hex,count,setLoadingProgress) 
                    :storedContrasts.results.length >= count ? storedContrasts.results.slice(0,count)
                    :null
                   if(contrasts == null && storedContrasts.results.length >0){
                        console.log("aded up UPPPPPPP")
                        console.log(storedContrasts.results, "here")
                        const dbColors:ColorSchemeTypeArr = storedContrasts.results
                        const newAdded:ColorSchemeTypeArr = await generateContrastingColors(hex,count - dbColors.length,setLoadingProgress,dbColors)
                        contrasts = [...dbColors,...newAdded]
                    }return contrasts
    }catch(err){
       throw err
    }       
}
const getColorInfo  =async(pick: string, count: number = 10, setLoadingProgress:(val:string)=>void ) :Promise<ColorInfo>=> {
                try{
                    const picked = pick.toUpperCase()                 
                
               
                     const mainColor: ColorType = await handleSingleColor(picked)
                       if(!mainColor) throw new Error("main color not found")  
                    const contrastNames : ColorSchemeTypeArr = await getContrastsInDB(mainColor.hex,count,setLoadingProgress) 
                    if (!contrastNames)throw new Error("Contrast colors not ffound")
                    return {mainColor,contrastColors: contrastNames} 
            }catch(err){
                throw err
        }
}
           
export default getColorInfo


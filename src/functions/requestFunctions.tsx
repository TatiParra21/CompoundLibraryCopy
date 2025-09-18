import type { ColorSchemeTypeArr, ColorType } from "../components/types"
import { getColorName } from "./fetchColorSchemes"
export type SavedUserColorSchemeType={
  user_id:string,
  scheme_name:string,
  hex1:string,
  hex1name:string,
  hex2:string,
  hex2name:string,
  contrast_ratio: number, 
  aatext:boolean, 
  aaatext:boolean
}
const sendRequestWithBody =async(method:string,body: Array<Record<string,string|number|boolean|string[]>>, //this states the body should be an object, where every key, and every val is a string
     route:string
    ): Promise<void>=>{     
    const response = await fetch(`https://compoundlibrarycopy.onrender.com/api/${route}`,{
        method:method,
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body) //stringifies the info for the backend
    })
    const data = await response.json()
    if(!data.found)console.log(`added to ${route} color: `, data)        
}

export type DeleteUserColorSchemeType={
    user_id:string,
    hex1:string,
    hex2:string,
}
export const sendUserDeleteRequest =async(schemeToDelete: DeleteUserColorSchemeType)=>{
    await sendRequestWithBody("DELETE",[schemeToDelete], "saved_user_color_schemes")

}
const submitGetRequest=  async(closest_named_hex: string, route:string): Promise<any>=>{
        try{
            const response = await fetch(`https://compoundlibrarycopy.onrender.com/api/${route}?closest=${encodeURIComponent(closest_named_hex)}`)
            const data = await response.json()    
            return data
        }catch(err){
            throw new Error(`in SubmitRequest in requestFunctions ${err}`)
        }
}
export const getUserSavedSchemesRequest=  async(user_id: string, route:string): Promise<any>=>{
        try{
            const response = await fetch(`https://compoundlibrarycopy.onrender.com/api/${route}?closest=${encodeURIComponent(user_id)}`)
            const data = await response.json()    
            return data
        }catch(err){
            throw new Error(`in SubmitRequest in requestFunctions ${err}`)
        }
}
type FrontEndColorType ={
name:string, closest_named_hex: string
}
export const addColorInfoToDB =async(arr: FrontEndColorType[])=>{
   await sendRequestWithBody("POST",arr, "named_colors")
}
export const handleSingleColor =async(hexVal:string):Promise<ColorType>=>{
      const hexing : checkIfVariantInDBResult= await checkIfVariantInDB(hexVal)
       const hexVariantArr:FrontEndHexBodyType[] = []
        const colorNameArr: FrontEndColorType[] =[]
        if(!hexing.results) {
            console.log("connfusioon")
                let test:ColorType =  await getColorName(hexVal)
                const {hex, closest_named_hex, clean_hex, name} = test
                 hexVariantArr.push({hex,closest_named_hex, clean_hex})
                  colorNameArr.push({name, closest_named_hex})
                     await sendRequestWithBody("POST",colorNameArr, "named_colors")
                  await sendRequestWithBody("POST",hexVariantArr,"hex_variants")
                  return test
        }else{
            return hexing.results[0] 
        }
        //if it isn't not only do we get it from the api but we also add it to the database
}


export const checkIfInDB =async(closest_named_hex:string)=>{
  const answer =  await submitGetRequest(closest_named_hex, "named_colors")
  return answer
}
export type checkIfVariantInDBResult ={
    results?: ColorType[]
    message: string
    found: boolean
}
export const checkIfVariantInDB = async(hex: string):Promise<checkIfVariantInDBResult>=>{
    const answer = await submitGetRequest(hex, "hex_variants")
    
    return answer
}
type FrontEndHexBodyType ={
    hex:string, closest_named_hex:string, clean_hex: string
}
export function delay(ms: number) {
            return new Promise((resolve) => {setTimeout(resolve, ms)});
}


export const checkIfContrastIn =async(mainHex:string)=>{
 const res = await submitGetRequest(mainHex, "color_contrasts")
 return res
}
type FrontEndColorContrastType ={
    hex1:string, hex2:string,contrast_ratio: number, aatext:boolean, aaatext: boolean
}
export const addColorContrastsArr = async(mainColor:string, otherColors: ColorSchemeTypeArr)=>{
    const hexVariantArr:FrontEndHexBodyType[] = []
    const colorContrastArr: FrontEndColorContrastType[] =[]
for(const col of otherColors){
    const {hex,closest_named_hex, clean_hex, contrast_ratio,aatext, aaatext
    } = col
    const [hex1,hex2] = [mainColor,hex].sort()
    hexVariantArr.push({hex,closest_named_hex, clean_hex})
    colorContrastArr.push({hex1,hex2,contrast_ratio:Number(contrast_ratio),aatext,aaatext})
    }
    await sendRequestWithBody("POST",colorContrastArr,"color_contrasts")
    await sendRequestWithBody("POST",hexVariantArr,"hex_variants")
}
export const addHexVariantsArr = async(otherColors: ColorSchemeTypeArr)=>{
     const hexVariantArr:FrontEndHexBodyType[] = []
    const colorNameArr: FrontEndColorType[] =[]
    for(const col of otherColors){
    const {hex, clean_hex, closest_named_hex, name} = col
    hexVariantArr.push({hex,closest_named_hex, clean_hex})
    colorNameArr.push({name, closest_named_hex})
    }
    await sendRequestWithBody("POST",colorNameArr, "named_colors")
    await sendRequestWithBody("POST",hexVariantArr,"hex_variants")
}

export const saveColorSchemeForUser =async(pickedScheme: SavedUserColorSchemeType)=>{
     await sendRequestWithBody("POST",[pickedScheme], "saved_user_color_schemes")
}
export type UpdateUserColorSchemeNameType={
  user_id:string,
  scheme_name:string,
    hex1:string,
    hex2:string,
}
export const updateSchemeNameForUser =async(pickedScheme: UpdateUserColorSchemeNameType)=>{
     await sendRequestWithBody("PATCH",[pickedScheme], "saved_user_color_schemes")
}
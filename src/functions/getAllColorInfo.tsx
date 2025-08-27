import type { ColorInfo } from "../components/types"
import getColorInfo from "./getColorInfo"
const getAllColorInfo =async(pick :string, count:number,setLoadingProgress:(val:string)=>void): Promise<ColorInfo>=>{
    if (!pick)throw new Error("Badges must be used inside a ColorProvider");
    try{
    const colorInf  =  await getColorInfo(pick,count,setLoadingProgress)
     if(!colorInf)throw new Error("Color name not found");
      return colorInf 
}catch(err :unknown){
    throw err 
  }
}
export default getAllColorInfo
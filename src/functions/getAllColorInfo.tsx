import type { ColorInfo } from "../components/types"
import getColorInfo from "./getColorInfo"

const getAllColorInfo =async(pick :string, count:number): Promise<ColorInfo>=>{
    // const [colorObj, setColorObj] = useState<string>("")
    //    const [colorPalattes, setColorPalletes] = useState<ColorSchemeType |null>(null)
    if (!pick) {
    throw new Error("Badges must be used inside a ColorProvider");
  }
    try{
       console.log("succedd or?")
    const colorInf  =  await getColorInfo(pick,count)
   
      //console.log(colorInf, "col inf")
     if(!colorInf){
      throw new Error("Color name not found");
    }  
      return colorInf 
  
}catch(err :unknown){
    throw err
    }
  }
export default getAllColorInfo
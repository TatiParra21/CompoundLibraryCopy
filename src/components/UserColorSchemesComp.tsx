
import { HexInfo } from "../components/HexInfo"
import { colorDataStore, type ColorDataStoreType } from "../store/projectStore"
import { PaginationComp } from "../components/PaginationComp"
import { authStateStore, type UserSchemesData } from "../store/projectStore"
import {  UserSchemeComponentBase } from "./ComponentBase"
import { LoadingRoller } from "./LoadingRoller"
import { useState, useEffect } from "react"
export const UserColorSchemesComp =()=>{
  
   const [loading, setLoading] = useState<boolean>(true)
   const userSchemes:UserSchemesData[] |null = authStateStore(state=>state.userSchemes)
useEffect(()=>{
    const loadColorSchemes = async()=>{   
        if(!loading)return
        setLoading(false)
    }
loadColorSchemes()
},[])
      
      console.log(userSchemes)
   if(loading || !userSchemes )return <div><LoadingRoller/></div>
   

   const allComponents = userSchemes.map((scheme: UserSchemesData)=>{
    
        return(<UserSchemeComponentBase key={`${scheme.hex1}-${scheme.hex2}-scheme`} userScheme={scheme}/>)
         }
        )
    return(
        <div className="result-sec flex-colum" >
            <HexInfo>
                <div className={`badges-sec`}>
                    {allComponents} 
                </div>
            </HexInfo>    
        </div>
    )
}
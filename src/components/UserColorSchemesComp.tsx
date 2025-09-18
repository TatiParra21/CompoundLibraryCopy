
import { HexInfo } from "../components/HexInfo"
import { colorDataStore, type ColorDataStoreType } from "../store/projectStore"
import { PaginationComp } from "../components/PaginationComp"
import { authStateStore, type UserSchemesData } from "../store/projectStore"
import {  UserSchemeComponentBase } from "./ComponentBase"

export const UserColorSchemesComp =()=>{
        const loading = colorDataStore(state=>state.loading)
   
      const userSchemes:UserSchemesData[] |null = authStateStore(state=>state.userSchemes)
      console.log(userSchemes)
   if(loading || !userSchemes)return <div>{loading ? `...Loading schemess `:`No schemes in collection Found` }</div>

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
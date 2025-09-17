import type { ColorInfo, ColorSchemeType } from "../components/types"
import { HexInfo } from "../components/HexInfo"
import DynamicComponent from "../components/DynamicComponent"
import { colorDataStore, selectDebouncedValue, selectLoadingProgress, selectSetColor, selectSetDebouncedValue, 
    type PaginationStoreType, paginationStore, selectLoading, selectAllInfo, selectColor, } from "../store/projectStore"
import { PaginationComp } from "../components/PaginationComp"

export const ComponentLayout =({type}:{type:string})=>{
   
    const loading = colorDataStore(selectLoading)
    const allInfo = colorDataStore(selectAllInfo)
    const color = colorDataStore(selectColor)
    const debouncedValue= colorDataStore(selectDebouncedValue)
    const loadingProgress = colorDataStore(selectLoadingProgress)

    const setDebouncedValue = colorDataStore(selectSetDebouncedValue)
    const setColor = colorDataStore(selectSetColor)

    const {currentPage, total}:PaginationStoreType = paginationStore(state=>state)
      
   if(loading || !allInfo)return <div>{loading ? `...Loading ${type}s currently ${loadingProgress} out of 50`:`No ${type}s Found` }</div>
   const {mainColor:{name:mainName, hex:mainHex}, contrastColors}:ColorInfo = allInfo
   const contrastColorsOrdered = contrastColors.sort((a,b)=>Number(b.contrast_ratio)-Number(a.contrast_ratio))
   const allComponents = contrastColorsOrdered.map((schemecolor:ColorSchemeType)=>{
     const {name, hex} = schemecolor
        return(<DynamicComponent type={type.toLocaleLowerCase()} baseColor={mainHex} key={hex} variant={schemecolor} colorName={name}/>)
         }
        ).slice(((currentPage -1)*50),(currentPage *50))
        const loadMore =()=>{
            setDebouncedValue({...debouncedValue,count:debouncedValue.count + 50})
            setColor(color!) 
        }
 return(
     <div className="result-sec flex-colum" >
        
            <div className="foreground-sec">
                    <h3>ForeGround:</h3>
                    <p style={{color:mainHex}}>{`${color} ${mainName}`}</p>
            </div>
                <h2>{`Total Colors Found: ${total} `}</h2>
                <button onClick={loadMore}>Load More?</button>
                  <PaginationComp />
                    <HexInfo>
            <div className={`${type.toLowerCase()}s-sec`}>
                {allComponents} 
            </div>
            </HexInfo>    
        </div>
 )
}
import { useEffect, useRef } from "react"
import type {ReactNode} from "react"
import getAllColorInfo from "../functions/getAllColorInfo"
import type { ColorInfo, ColorSchemeTypeArr} from "./types"
import { addHexVariantsArr, addColorContrastsArr } from "../functions/requestFunctions"
import { handleError } from "../functions/handleError"
import type{ DebouncedValues } from "../store/projectStore"
import { colorDataStore, type ColorDataStoreType } from "../store/projectStore"
import { paginationStore, type PaginationStoreType } from "../store/projectStore"
const saveAllData =async(bestColors: ColorSchemeTypeArr, baseColor: string)=>{
    await addHexVariantsArr(bestColors)
    await addColorContrastsArr(baseColor,bestColors)
}
const ColorPicker =({children }:{children?:ReactNode})=>{
    const colorRef = useRef<string>("")
    const {allInfo,loading,setAllInfo,color,setColor,isDisabled, setIsDisabled, debouncedValue, setDebouncedValue,setLoadingProgress, setLoading,setErrorMessage}: ColorDataStoreType = colorDataStore(state=>state)
   const {setCurrentPage, setTotal}: PaginationStoreType =paginationStore(state=>state)
    useEffect(()=>{
        if(!allInfo)return
        const {contrastColors, mainColor} = allInfo
        saveAllData(contrastColors,mainColor.hex)
        setTotal(contrastColors.length)
     },[allInfo])

    useEffect(()=>{
        if (!color)return
        setLoading(true)
        const fetchAll =async() =>{
            try{  
             const colorInfo : ColorInfo = await getAllColorInfo(color, debouncedValue.count,setLoadingProgress)  
             if(!colorInfo) throw new Error( "Color picker could not get colorInfo")
             setAllInfo(colorInfo)
            const totalPages = (Number((colorInfo.contrastColors.length/50).toFixed(0)))
            setCurrentPage(totalPages) 
            }catch(err){
                setErrorMessage( handleError(err, "ColorPicker"))       
         }finally{
            setLoading(false)
        } 
    };  fetchAll() 
    },[color,debouncedValue.count])
    const choseFromColorInput =(input: keyof DebouncedValues)=>{  
        const mainVal = debouncedValue[input]
        if(typeof mainVal == "string" ){
            if( input == "textInput"){
            setColor(mainVal)
              setIsDisabled(true) 
            setDebouncedValue({...debouncedValue, count:50})     
            }
        }
        if(!color){ 
            setColor(debouncedValue.textInput)
              setIsDisabled(true) 
        }     
    }    
    const debouncedValueFunction =(delay:number)=>{
        let timer:ReturnType<typeof setTimeout>
        return (e: React.ChangeEvent<HTMLInputElement>)=>{ 
            colorRef.current = e.target.value
            if(timer)clearTimeout(timer)
                timer = setTimeout(()=>{
             setDebouncedValue({ ...debouncedValue, textInput:colorRef.current})
             setIsDisabled(false)
            },delay)
        }
    }
const updateDebouncedValue = debouncedValueFunction(300)
    return(
        <>
            <div className="flex-colum center-class">
                <div className="flex-row color-picker-sec">
                    <div className="flex-colum test-class" >
                        <input type="color" id="picker" value={debouncedValue.textInput ?? "#000000"} onChange={(e)=>updateDebouncedValue(e)}/>
                        <input type="text" id="write" value={debouncedValue.textInput ?? ""} onChange={(e)=>updateDebouncedValue(e)}/>
                    </div>        
            </div> 
             <button className="search-btn" disabled={loading ? true :isDisabled} onClick={()=>choseFromColorInput("textInput")}>Search contrasting colors</button> 
        </div>
            <>
                {children}
            </>   
        </>
    )
}

export default ColorPicker

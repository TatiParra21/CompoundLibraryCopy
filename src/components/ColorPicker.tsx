import { useEffect, useRef } from "react"
import type {ReactNode} from "react"
import getAllColorInfo from "../functions/getAllColorInfo"
import type {ColorInfo} from "./types"
import { handleError } from "../functions/handleError"
import type{ DebouncedValues } from "../store/projectStore"
import { colorDataStore, type ColorDataStoreType } from "../store/projectStore"
import { paginationStore, type PaginationStoreType } from "../store/projectStore"

const ColorPicker =({children }:{children?:ReactNode})=>{
    const colorRef = useRef<string>("") //Reference to store latest color input, 
    //this grabs states and actions from the global store using zustand
    const {allInfo,loading,setAllInfo,color,setColor,isDisabled, setIsDisabled, debouncedValue, setDebouncedValue,setLoadingProgress, setLoading,setErrorMessage}: ColorDataStoreType = colorDataStore(state=>state)
   const {setCurrentPage, setTotal}: PaginationStoreType =paginationStore(state=>state)
   //Saves fetched colors to Supabase everytime allInfo updates
    useEffect(()=>{
        if(!allInfo)return
        const {contrastColors, mainColor} = allInfo
        
        setTotal(contrastColors.length)
     },[allInfo])
     //fetches color from API or supabase whenever the selected color changes or the count changes.
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
    //Function that runs when user clicks on Search Constrasting Colors
    const choseFromColorInput =(input: keyof DebouncedValues)=>{  
        //based on the color chosen on the input chosen by the user, the state of the color is set.
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
    /// A function meant to debounde the color input.   
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
             <button className="search-btn" disabled={loading ? true :isDisabled} onClick={()=>choseFromColorInput("textInput")}>{loading ? "...loading" : "Search contrasting colors"}</button> 
                <button 
                                onClick={async () => {
                                  try {
                                    const text = await navigator.clipboard.readText(); // get clipboard text
                                    if (!text) return;

                                    // update store state directly
                                    setDebouncedValue({ ...debouncedValue, textInput: text });
                                    setColor(text); 
                                    setIsDisabled(false); 
                                  } catch (err) {
                                    console.error("Failed to read clipboard", err);
                                    setErrorMessage("Could not paste from clipboard");
                                  }
                                }}
                                >
                                    Paste from clipboard
                            </button>
        
        </div>
            <>
                {children}
            </>   
        </>
    )
}

export default ColorPicker

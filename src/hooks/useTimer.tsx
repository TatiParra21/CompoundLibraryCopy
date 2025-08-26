
import {useEffect, useState} from "react"

const useTimer =(func: (value:string)=>void)=>{

    const [inputValue, setInputValue] = useState("")
    const [, setDebouncedValue] = useState(inputValue)


    const activate =()=>{
        func(inputValue)
    }
    useEffect(()=>{

        const timer = setTimeout(()=>{
            setDebouncedValue(inputValue)
        },500)

        return()=>{
            clearTimeout(timer)
        }


    },[inputValue])

    
return{setInputValue, inputValue, activate}


}

export default useTimer
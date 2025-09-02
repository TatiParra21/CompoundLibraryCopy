import { create } from "zustand";
import type { ColorInfo } from "../components/types";

export type HexSizeStoreType ={
    textType: "Normal" | "Large",
    setTextType: (value:"Normal" | "Large")=>void
}
export type DebouncedValues ={
    count:number
    textInput:string
}
export type ColorDataStoreType ={
    isDisabled:boolean,
    setIsDisabled: (val:boolean)=>void,
    color:string | null
    setColor:(color:string)=>void
    loadingProgress: string,
    setLoadingProgress:(message:string)=>void
    loading: boolean
    setLoading: (value: boolean)=>void
    allInfo: ColorInfo |null
    setAllInfo: (allInfo:ColorInfo)=>void
    debouncedValue: DebouncedValues,
    setDebouncedValue: (values:DebouncedValues)=>void,
    errorMessage: string |null,
    setErrorMessage:  (message:string)=>void
     copyHex: (val:string)=>void,
}
export const hexSizeStore = create<HexSizeStoreType>((set)=>({
    textType:"Normal",
    setTextType:(value: "Normal" | "Large") => set({textType:value})
}))


export const colorDataStore = create<ColorDataStoreType>((set)=>({
    isDisabled:false,
    setIsDisabled: (val:boolean)=> set({isDisabled:val}),
     color:"",
     setColor:(color:string)=>set({color}),
     loadingProgress: "0",
    setLoadingProgress:(message:string)=>set({loadingProgress:message}),
    loading: false,
    setLoading: (value:boolean)=>set({loading:value}),
    allInfo: null,
    setAllInfo:(allInfo:ColorInfo)=>set({allInfo}),
   
     debouncedValue: {textInput:"#000000", count:50},
    setDebouncedValue: (values:DebouncedValues)=>set({debouncedValue:values}),
     errorMessage: null,
    setErrorMessage:  (message:string)=>set({errorMessage:message}),
     copyHex: (val:string)=>set((state)=>({
        debouncedValue:{...state.debouncedValue, textInput:val}
    }))

}))

export type PaginationStoreType ={
    currentPage: number,
    pageSize: number,
    total: number,
    setTotal:(num:number)=>void,
    setCurrentPage: (page:number)=>void

}

export const paginationStore = create<PaginationStoreType>(set=>({
    currentPage:1,
    pageSize:50,
    total:0,
    setTotal:(num:number)=>set({total:num}),
    setCurrentPage:(page:number)=>set({currentPage:page})
}))
/*
export type AuthStoreType ={
    session: 
} */
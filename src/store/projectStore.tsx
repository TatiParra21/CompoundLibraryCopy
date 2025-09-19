import { create } from "zustand";
import type { ColorInfo } from "../components/types";
import { supabase } from "../supabaseClient";
import { getUserSavedSchemesRequest } from "../functions/requestFunctions";
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
export const selectLoading = (state: ColorDataStoreType) => state.loading;
export const selectAllInfo = (state: ColorDataStoreType) => state.allInfo;
export const selectColor = (state: ColorDataStoreType) => state.color;
export const selectDebouncedValue = (state: ColorDataStoreType) => state.debouncedValue;
export const selectLoadingProgress = (state: ColorDataStoreType) => state.loadingProgress;

export const selectSetColor = (state: ColorDataStoreType) => state.setColor;
export const selectSetDebouncedValue = (state: ColorDataStoreType) => state.setDebouncedValue;
export const selectSetLoadingProgress = (state: ColorDataStoreType) => state.setLoadingProgress;

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

export type SupabaseInfoType ={
    email:string,
    setEmail:(val:string)=>void,
    authError: string |null,
    setAuthError:  (message:string|null)=>void 
}

export const supabaseInfoStore = create<SupabaseInfoType>((set)=>({
     email:"",
    setEmail:(val:string)=>set({email:val}),
    authError: null,
    setAuthError:  (message:string|null)=>set({authError:message})
}))
export type UserSchemesData={
  scheme_name:string,
  hex1:string,
  hex1name:string,
  hex2:string,
  hex2name:string,
  contrast_ratio: number, 
  aatext:boolean, 
  aaatext:boolean
}
export type AuthStateType = {
  session: any | null,
  userId:string |null,
  userSchemes: UserSchemesData[] |null,
  setUserSchemes: (schemes:UserSchemesData[] |null) =>void,
  fetchUserSchemes: (userId:string)=>Promise<UserSchemesData[]>
  setSession: (session: any | null) => void;
  initAuth: () => void;
}

export const authStateStore = create<AuthStateType>((set)=>{
    let sessionInProgress = false; 
    
    return{
          session:  null,
  setSession: (session: any | null) => set({session:session}),
  userId: null,
  userSchemes:null, 
  setUserSchemes: (schemes:UserSchemesData[] |null)=>set({userSchemes: schemes}),
 fetchUserSchemes: async(userId:string):Promise<UserSchemesData[]>=>{
   
    const userData = await getUserSavedSchemesRequest(userId,"saved_user_color_schemes")
    return userData.results

 },
  initAuth: async() => {
    try{
        if(sessionInProgress)return
        sessionInProgress = true
        const {data, error} = await supabase.auth.getSession()
        if(!data)throw new Error("error was here")
            if(error)throw error
        set({session:data.session,

        })
    }catch(err){
        console.warn("Auth lock error ignored", err)
        console.error("there was an error here")
    }finally {
    sessionInProgress = false;
  }    
        supabase.auth.onAuthStateChange((_event, newSession) => {
       console.log(newSession, "session")
       
          set({ session: newSession,
                userId:newSession?.user?.id,
                

          });
        });
    }      
    }
})


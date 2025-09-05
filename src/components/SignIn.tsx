
import { LoginButton } from "./LoginButton"
import { supabase } from "../supabaseClient"
import { supabaseInfoStore} from "../store/projectStore"
import type { ReactEventHandler } from "react"
import { useRef } from "react"
const debounceTyping =( delay:number )=>{{  
    let timer:ReturnType<typeof setTimeout>
    return (setValue:(val:string)=>void,ref:string)=>{
        if(timer)clearTimeout(timer)
            timer = setTimeout(()=>{
                setValue(ref)
        },delay)
    }
}}
export const FormComponent = ({type}:{type:string})=>{
    const authError = supabaseInfoStore(state => state.authError)
    const setAuthError = supabaseInfoStore(state => state.setAuthError)
    const email = supabaseInfoStore(state => state.email)
    const setEmail = supabaseInfoStore(state => state.setEmail)
    const password = supabaseInfoStore(state => state.password)
    const setPassword = supabaseInfoStore(state => state.setPassword)
    const emailRef = useRef<string>("")
    const passwordRef =  useRef<string>("")
    const debounceInfo = debounceTyping(400)
   

    const handleSubmit=async(e: React.FormEvent<HTMLFormElement>)=>{
        try{
        e.preventDefault()
             const {data, error} = type == "sign-in" ? await supabase.auth.signInWithPassword({email, password}) : await supabase.auth.signUp({email, password})
           if (error) throw new Error(error.message)
      console.log("Logged in!", data.user)
        setAuthError(null)
        }catch(err){
            if(typeof err == "string")setAuthError(err)

        }finally{
        setEmail("");
        setPassword("");
     
        
        }
   
    }
    return(
        <div  className="sign-form-container flex colum">
            <form onSubmit={handleSubmit}
            aria-label="Sign in form"
          aria-describedby="form-description">
            <div>
                <label htmlFor="email">Email</label>
                <input 
                id="email" 
                type="email" 
                name="email"
                defaultValue={email}
                 ref={(el) => {
    if (el && email === "") el.value = ""; // clear input if store resets
  }}
                onChange={(e)=>{emailRef.current = e.target.value, debounceInfo(setEmail,emailRef.current)}}
                ></input>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input 
                id="password" 
                type="password" 
                name="password"
                defaultValue={password}
                ref={(el) => {
    if (el && email === "") el.value = ""}}
                
                onChange={(e)=>{passwordRef.current = e.target.value, debounceInfo(setPassword,passwordRef.current)}}
                ></input>
            </div>

              {authError && <p>{authError}</p>}

        <button type="submit">{type == "sign-in" ? "Sign In": "Sign Up"}</button>
        
            </form>
            <LoginButton/>

        </div>
    )

}




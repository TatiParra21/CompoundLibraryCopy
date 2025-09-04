import { LoginButton } from "./LoginButton"
import { supabase } from "../supabaseClient"
import { supabaseInfoStore, type SupabaseInfoType } from "../store/projectStore"
const FormComponent = ({handleSubmit}:{handleSubmit:(e: React.FormEvent<Element>) => void})=>{
    const {authError, setAuthError, password,email, setEmail, setPassword}:SupabaseInfoType = supabaseInfoStore(state=>state)
    return(
        <div  className="sign-form-container">
            <form onSubmit={handleSubmit}
            aria-label="Sign in form"
          aria-describedby="form-description">
            <label htmlFor="email">Email</label>
            <input 
            id="email" 
            type="email" 
            name="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            ></input>
             <label htmlFor="password">Email</label>
            <input 
            id="password" 
            type="password" 
            name="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}


            ></input>

        <button type="submit">Sign in</button>
        
            </form>
            <LoginButton/>

        </div>
    )

}
export const SignUp =()=>{
const {authError, setAuthError, password,email,setEmail,setPassword}:SupabaseInfoType = supabaseInfoStore(state=>state)
    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault()
            const {data, error} = await supabase.auth.signUp({email, password})
           if (error) {
      setAuthError(error.message)
    } else {
      console.log("Logged in!", data.user)
      setAuthError(null)
       setEmail("");
    setPassword("");
    }
    }
    
    return(
        <div className="sign-form-container">
            <FormComponent handleSubmit={handleSubmit}/>
            {authError && <p>{authError}</p>}


        </div>
    )


}

export const SignIn =()=>{
const {authError, setAuthError, password,email}:SupabaseInfoType = supabaseInfoStore(state=>state)
    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault()
            const {data, error} = await supabase.auth.signInWithPassword({email, password})
           if (error) {
      setAuthError(error.message)
    } else {
      console.log("Logged in!", data.user)
      setAuthError(null)
    }
    }
    
    return(
        <div className="sign-form-container">
            <FormComponent handleSubmit={handleSubmit}/>
            {authError && <p>{authError}</p>}


        </div>
    )


}
import { LoginButton } from "./LoginButton"
import { supabase } from "../supabaseClient"
import { supabaseInfoStore} from "../store/projectStore"
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

 const capitalizeFirstLetter =(value: string):string=>{
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
const InputComponent =({type, category}:{type:string, category:string})=>{
    return(
         <div className="sign-in-div flex-row">
                <label htmlFor={category}>{capitalizeFirstLetter(category)}:</label>
                <input 
                id={category} 
                type={category} 
                name={category}
                defaultValue=""
                autoComplete={category =="email" ?"username" :type === "sign-in"  ? "current-password" : "new-password"}
                ></input>
            </div>         
    )
}
export const FormComponent = ({type}:{type:string})=>{
    const navigate = useNavigate()
    const authError = supabaseInfoStore(state => state.authError)
    const setAuthError = supabaseInfoStore(state => state.setAuthError)
    const setEmail = supabaseInfoStore(state => state.setEmail)
   
    const location = useLocation()
    const fromFeature = location.state?.fromFeature ? location.state.fromFeature : ""
    const handleSubmit=async(e: React.FormEvent<HTMLFormElement>)=>{
        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        try{
            e.preventDefault()
             const { error} = type == "sign-in" ? await supabase.auth.signInWithPassword({email, password}) : await supabase.auth.signUp({email, password})
            if (error) throw new Error(error.message)
            setAuthError(null)
            navigate("/")   
        }catch(err){
            if(typeof err == "string")setAuthError(err)
        }finally{
        setEmail("");
        }
    }
    return(
        <div  className="sign-form-container flex colum">
            <form onSubmit={handleSubmit}
            aria-label="Sign in form"
            aria-describedby="form-description"
            className="flex colum">
                {fromFeature && fromFeature =="save" && <p>You must be logged in to save</p> }
                <InputComponent category="email" type={type}/>
                <InputComponent category="password" type={type}/>
              {authError && <p>{authError}</p>}
                <button type="submit">{type == "sign-in" ? "Sign In": "Sign Up"}</button>
   
       
            </form>
            <LoginButton/>
                 {
            type =="sign-in" ? <div>
                 <p>Don't have an account? </p>
                 <NavLink to="/sign-up">Create one</NavLink>
            </div> :
            <div>
                 <p>Already have an account? </p>
                 <NavLink to="/sign-in">Sign in</NavLink>
            </div>
        }
        </div>
    )
}




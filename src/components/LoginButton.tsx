import { supabase } from "../supabaseClient"

export const LoginButton =()=>{
console.log("login button")
    const signInWithGoogle =async()=>{
        try{
             const {data, error} = await supabase.auth.signInWithOAuth({
            provider:"google"
        })
        if(error){
            console.error("Google sign in error", error)
        }else{ 
            console.log("redirecting . google login")
          
        }
        }catch(err){
            console.error("Google sign in error", err)
        }
       
        
    }
    return(
        <>
        <button onClick={(e)=>{ e.preventDefault(); signInWithGoogle; }}>Sign in With Google</button>
        
        </>
    )

}


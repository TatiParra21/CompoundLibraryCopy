import { supabase } from "../supabaseClient"
export const LoginButton =()=>{

    const signInWithGoogle =async()=>{
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider:"google"
        })
        if(error){
            console.error("Google sign in error", error)
        }else{
            console.log("redirecting to google login")
            console.log(supabase.auth.getSession())
        }
        
    }
    return(
        <>
        <button onClick={(e)=>{ e.preventDefault(); signInWithGoogle(); }}>Sign in With Google</button>
        
        </>
    )

}
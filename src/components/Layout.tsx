import { Outlet } from "react-router-dom"
import {type JSX } from "react"
 import Header from "./Header"
import { NavLink } from "react-router-dom"
import { authStateStore } from "../store/projectStore"
import { UserMenu, } from "./UserMenu"
import { supabaseInfoStore } from "../store/projectStore"
import { getUserSavedSchemesRequest } from "../functions/requestFunctions"
const SignInUpComponents =():JSX.Element=>{
    return(
        <div className="auth-btns flex-row">
                    <NavLink to="sign-in" >Sign In</NavLink>
                    <NavLink  to="sign-up" >Sign Up</NavLink>
         </div>
    )
}
//  <NavLink to="my-color-schemes" >My ColorSchemes</NavLink> 
const UserIsSignedIn =({ email, userId }: { email: string, userId:string |null})=>{
    const getUserSchemes = async()=>{
        try{
            if(!userId)return
             const schemes =  await getUserSavedSchemesRequest(userId,"saved_user_color_schemes")
            console.log(schemes)


        }catch(err){
            throw err

        }
      

    }
    return(
        <div className="auth-btns flex-row">
       
          <button onClick={getUserSchemes}>My colorSchemes</button>
           <UserMenu email={email}/>
         </div>
        
    )
}
 const Layout =()=>{
    const session = authStateStore(state=>state.session)
  const userId = authStateStore(state=>state.userId)
    const email = supabaseInfoStore(state=>state.email)
  
   
    return(
        <>
            <main>
                {session ? <UserIsSignedIn email={email} userId={userId}/> : <SignInUpComponents/>}
                    <Header/>
                    <Outlet/>
            </main>
            <footer>This is the Footer</footer>
        </>    
    )
 }

 
 export default Layout

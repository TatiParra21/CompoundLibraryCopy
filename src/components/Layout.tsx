import { Outlet } from "react-router-dom"
import {type JSX } from "react"
 import Header from "./Header"
import { NavLink } from "react-router-dom"
import { authStateStore } from "../store/projectStore"
import { UserMenu, } from "./UserMenu"
import { supabaseInfoStore, } from "../store/projectStore"

const SignInUpComponents =():JSX.Element=>{
    return(
        <div className="auth-btns flex-row">
                    <NavLink to="sign-in" >Sign In</NavLink>
                    <NavLink  to="sign-up" >Sign Up</NavLink>
         </div>
    )
}
//  
const UserIsSignedIn =({ email, userId }: { email: string, userId:string |null})=>{
    const userSchemes = authStateStore(state=>state.fetchUserSchemes)
   
    return(
        <div className="auth-btns flex-row">
       
          <NavLink to="my-color-schemes" >My ColorSchemes</NavLink> 
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

import { Outlet } from "react-router-dom"
import useToggle from "../hooks/useToggle"
import { createContext, useContext } from "react"
 import Header from "./Header"
 export type ToggleContextType =[boolean, ()=> void]
 const ToggleContext = createContext<ToggleContextType |null>(null)
 export const useToggleContext=()=>{
    const context = useContext(ToggleContext)
    if(!context)throw new Error("There was an error using toggle context")
    return context
}
 const Layout =()=>{
    const [open, toggle] = useToggle()
    return(
        <>
            <main>
                <div className="auth-btns flex-row">
                    <button>Sign In</button>
                    <button>Sign Up</button>
                </div>
                <ToggleContext.Provider value={[open,toggle]}>
                    <Header/>
                    <Outlet/>
                </ToggleContext.Provider>
            </main>
            <footer>This is the Footer</footer>
        </>    
    )
 }
 export default Layout
 export{ToggleContext}
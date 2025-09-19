
import { createBrowserRouter, RouterProvider  } from 'react-router-dom'
import './App.css'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Badges from './pages/Badges'
import { SubLayout } from './components/SubLayout'
import { FormComponent} from './components/SignIn'
import { Provider } from './components/ui/provider'
import {  authStateStore } from './store/projectStore'
import { supabaseInfoStore } from './store/projectStore'
import { UserColorSchemesComp } from './components/UserColorSchemesComp'
import { LoadingRoller } from './components/LoadingRoller'
const router = createBrowserRouter([
  {path:"/",element:<Layout/>,
  children:[
    {index:true, element:<Dashboard/>},
     {path:"sign-in",element:<FormComponent type="sign-in"/>,
       errorElement: <h2>Oops! Page not found or crashed.</h2>
     },
        {path:"sign-up",element:<FormComponent type="sign-up"/>,
           errorElement: <h2>Oops! Page not found or crashed.</h2>
        },
        {path:"my-color-schemes",element:<UserColorSchemesComp/>,
           errorElement: <h2>Oops! Page not found or crashed.</h2>
        },
    {
      element:<SubLayout/>,
      children:[
        {path:"badges",element:<Badges/>},
      
        {path:"cards",element:<Cards/>},
      ] 
    }
  ]
  }
])

function App() {
const [loadingSection, setLoadingSection] = useState<boolean>(true)

const initAuth = authStateStore(state=>state.initAuth)
const session = authStateStore(state=>state.session)
const setEmail = supabaseInfoStore(state=>state.setEmail)
const email = supabaseInfoStore(state=>state.email)
const fetchUserSchemes = authStateStore(state=>state.fetchUserSchemes)
const setUserSchemes = authStateStore(state=>state.setUserSchemes)
  const userId = authStateStore(state=>state.userId)

 

  useEffect(()=>{
    const runInitAuth =async()=>{
      try{
       initAuth()

      }catch(err){

      }finally{
        setLoadingSection(false)
      }

    }
    runInitAuth()
   
  },[])
  useEffect(()=>{
    if(email)return
    if(session)
   setEmail(session.user.email)
   
  },[session])

  useEffect(()=>{
    const getUserSchemes = async()=>{
          try{
          
              if(!userId)return
              const schemes = await fetchUserSchemes(userId)
             setUserSchemes((schemes))
          }catch(err){
              throw err
          }
      }
      getUserSchemes()
  
   
  },[session])

  if(loadingSection){
    return( <LoadingRoller/>)

  }
  return (
    <>
    <Provider>
      <RouterProvider router={router}/>
    </Provider>
      
    </>
  )
}

export default App

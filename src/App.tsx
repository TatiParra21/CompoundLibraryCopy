
import { createBrowserRouter, RouterProvider  } from 'react-router-dom'
import './App.css'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Badges from './pages/Badges'
import Banners from './pages/Banners'
import { SubLayout } from './components/SubLayout'
import { FormComponent} from './components/SignIn'
import { Provider } from './components/ui/provider'
import {  authStateStore } from './store/projectStore'
import { supabaseInfoStore } from './store/projectStore'

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
    {
      element:<SubLayout/>,
      children:[
        {path:"badges",element:<Badges/>},
        {path:"banners",element:<Banners/>},
        {path:"cards",element:<Cards/>},
      ]
    
    }
  ]
  }
])

function App() {

const initAuth = authStateStore(state=>state.initAuth)
const session = authStateStore(state=>state.session)
const setEmail = supabaseInfoStore(state=>state.setEmail)
const email = supabaseInfoStore(state=>state.email)
  useEffect(()=>{
   initAuth()
  },[])
  useEffect(()=>{
    if(email)return
    if(session)
   setEmail(session.user.email)
  },[session])
  return (
    <>
    <Provider>
      <RouterProvider router={router}/>
    </Provider>
      
    </>
  )
}

export default App

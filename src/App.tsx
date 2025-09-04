
import { createBrowserRouter, RouterProvider  } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Badges from './pages/Badges'
import Banners from './pages/Banners'
import { SubLayout } from './components/SubLayout'
import { SignIn } from './components/SignIn'
import { SignUp } from './components/SignIn'

const router = createBrowserRouter([
  {path:"/",element:<Layout/>,
  children:[
    {index:true, element:<Dashboard/>},
     {path:"sign-in",element:<SignIn/>},
        {path:"sign-up",element:<SignUp/>},
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
 

  return (
    <>
<RouterProvider router={router}/>
      
    </>
  )
}

export default App

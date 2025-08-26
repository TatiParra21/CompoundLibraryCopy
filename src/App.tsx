
import { Route, Routes, BrowserRouter  } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Badges from './pages/Badges'
import Banners from './pages/Banners'
import { SubLayout } from './components/SubLayout'

function App() {
 

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<Dashboard/>}/>
            <Route element={<SubLayout/>}>
              <Route path="badges" element={<Badges/>}/>
              <Route path="banners" element={<Banners/>}/>
              <Route path="cards" element={ <Cards/>}/>
            </Route>
          
          
          
          </Route>
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App

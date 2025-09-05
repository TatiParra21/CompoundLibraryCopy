import { Outlet } from "react-router-dom"
import ColorPicker from "./ColorPicker"
export const SubLayout =()=>{
   
return(
    <ColorPicker>
             <Outlet/>
    </ColorPicker>
)
}
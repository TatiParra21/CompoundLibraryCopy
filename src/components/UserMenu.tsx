import {
  Avatar,
  HStack,
  HoverCard,
  Icon,
  Link,
  Portal,
  Stack,
  Text,useAvatar, Button
} from "@chakra-ui/react"
import { supabase } from "../supabaseClient"
import { supabaseInfoStore } from "../store/projectStore"
export const Logout =({handleLogout}:{handleLogout:  () => Promise<void>}) =>{

  return (
    <HStack>
      <Button onClick={handleLogout} >Logout</Button>

    </HStack>
  )
}
"use client"



export const Dem = () => {
  const avatar = useAvatar()
  return (
    <Stack align="flex-start">
      <Avatar.RootProvider value={avatar}> 
      </Avatar.RootProvider>
      
    </Stack>
  )
}
const AvatarComponent =()=>{
  return(
        <Avatar.Root colorPalette="red">
                  <Avatar.Fallback />
                 
        </Avatar.Root>
  )
}
import { LuChartLine } from "react-icons/lu"

export const UserMenu = ({ email }: { email: string }) => {
    const setEmail = supabaseInfoStore(state => state.setEmail)
         const resetInfo=()=>{
            setEmail("")
         }
  const handleLogout=async()=>{
      
    try{
      const {error} = await supabase.auth.signOut()
      if(error)throw new Error(error.message)
        resetInfo()
    }catch(err){
      console.error(err)
    }
  }
       
  return (
    <HoverCard.Root size="sm">
      <HoverCard.Trigger asChild>
        <Link href="#">
           <AvatarComponent/>
        
        </Link>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content>
            <HoverCard.Arrow />

            <Stack gap="4" direction="row">
              <AvatarComponent/>
              <Stack gap="3">
                <Stack gap="1">
                  <Text textStyle="sm" fontWeight="semibold">
                    {email}
                  </Text>
                  <Logout handleLogout={handleLogout} />
                </Stack>
                <HStack color="fg.subtle">
                  <Icon size="sm">
                    <LuChartLine />
                  </Icon>
                  <Text textStyle="xs">2.5M Downloads</Text>
                </HStack>
              </Stack>
            </Stack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  )
}

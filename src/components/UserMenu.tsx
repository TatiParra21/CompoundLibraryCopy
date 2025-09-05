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

export function Logout({ email }: { email: string }) {
  return (
    <HStack>
      <Button>CLiCK</Button>

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
                  <Text textStyle="sm" color="fg.muted">
                    The most powerful toolkit for building modern web
                    applications.
                  </Text>
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

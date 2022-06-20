import 'react-native-url-polyfill/auto'
import {useEffect, useState} from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Registration from './components/Registration'
import { NavigationContainer, StackActions } from '@react-navigation/native'
import { createNativeStackNavigator} from '@react-navigation/native-stack'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import LoginSignupScreen from './components/LoginSignupScreen'
import Listings from './components/Listings'
import {ProfileStack} from './components/Profile'
import {FeedStack}from './components/Feed'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let mounted = true;
    if (mounted){
      setSession(supabase.auth.session())

      supabase.auth.onAuthStateChange((_event, session) => {
        console.log(session)
        setSession(session)
      })
    }
    if (session){

    }
    return () => {mounted = false}
  }, [])
  
  return (
    <NavigationContainer>
      {session ? 
        <Tab.Navigator>
          <Tab.Screen name="Feed" component={FeedStack} options ={{headerShown:false}} />
          <Tab.Screen name="Profile" component={ProfileStack} options={{headerShown: false}} />
          <Tab.Screen name="Listings" component={Listings} />
        </Tab.Navigator> :
        <Stack.Navigator>
          <Stack.Screen name="InitialPage" component={LoginSignupScreen} />
          <Stack.Screen name="Auth" component={Auth}/>
          <Stack.Screen name="Registration" component={Registration}/>
        </Stack.Navigator> }
    </NavigationContainer>
  )
}

export default App;
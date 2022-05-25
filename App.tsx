import 'react-native-url-polyfill/auto'
import * as React from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import Registration from './components/Registration'
import { NavigationContainer, StackActions } from '@react-navigation/native'
import { createNativeStackNavigator} from '@react-navigation/native-stack'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import LoginSignupScreen from './components/LoginSignupScreen'
import HomePage from './components/HomePage'
import Profile from './components/Profile'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [session, setSession] = React.useState<Session | null>(null)

  React.useEffect(() => {
    let mounted = true;
    if (mounted){
      setSession(supabase.auth.session())

      supabase.auth.onAuthStateChange((_event, session) => {
        console.log(session)
        setSession(session)
      })
    }
    return () => {mounted = false}
  }, [])

  const Stack = createNativeStackNavigator();
  
  return (
    <NavigationContainer>
      {session ? 
        <Tab.Navigator>
          <Tab.Screen name="HomePage" component={HomePage} initialParams={{session: session}} />
          <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
        : 
        <Stack.Navigator>
          <Stack.Screen name="Home" component={LoginSignupScreen} />
          <Stack.Screen name="Auth" component={Auth}/>
          <Stack.Screen name="Registration" component={Registration}/>
          <Stack.Screen name="HomePage" component={HomePage}/>
        </Stack.Navigator>
      }
    </NavigationContainer>
  )
}

export default App;
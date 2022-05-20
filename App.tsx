import 'react-native-url-polyfill/auto'
import * as React from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import { NavigationContainer, StackActions } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import LoginSignupScreen from './components/LoginSignupScreen'

const Stack = createNativeStackNavigator();

function App() {
  const [session, setSession] = React.useState<Session | null>(null)

  React.useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={LoginSignupScreen} />
        <Stack.Screen name="Auth" component={Auth}/>
        <Stack.Screen name="Registration" component={Account}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;
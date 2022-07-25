import 'react-native-url-polyfill/auto'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Authentication/Login'
import Registration from './components/Authentication/Registration'
import { NavigationContainer, StackActions } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { Text } from 'react-native'
import { Session } from '@supabase/supabase-js'
import Welcome from './components/Authentication/LoginSignupScreen'
import Listings from './components/Listings Components/Listings'
import { ProfileStack } from './components/Profile/Profile'
import { FeedStack } from './components/NewsFeed/Feed'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { EditProfile } from './components/Profile/EditProfile'
import AllChats from './components/Chat/AllChats'
import BuddyFinding from './components/BuddyFinder/BuddyFinding'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [firstLogin, setFirstLogin] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setSession(supabase.auth.session())
      supabase.auth.onAuthStateChange((_event, session) => {
        //console.log(session)
        setSession(session)
      })
    }
    return () => { mounted = false }
  }, [session])

  useEffect(() => {
    const getFirstLogin = async () => {
      let { data, error } = await supabase.from("profiles").select("set").match({ id: supabase.auth.session().user.id }).single();
      if (data) {
        setFirstLogin(!data.set);
        console.log(data.set);
        console.log("FAFAF");
      }
    }
    supabase.auth.onAuthStateChange((_event, session) => {
      getFirstLogin();
    })
  }, [])
  return (
    <NavigationContainer>
      {session ?
        firstLogin ? 
        <Stack.Navigator>
          <Stack.Screen name ="Edit Profile" component={EditProfile} initialParams={{uuid: session.user.id, firstLogin:true, update: setFirstLogin}} />
        </Stack.Navigator> :
          <Tab.Navigator initialRouteName='Feed'>
            <Tab.Screen name="Feed" component={FeedStack} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} initialParams={{ visitor: false, uuid: session.user ? session.user.id : null }} />
            <Tab.Screen name="Listings" component={Listings} />
            <Tab.Screen name="Find a buddy" component={BuddyFinding} />
            <Tab.Screen name="Chats" component={AllChats} options={{ headerShown: false }} />
          </Tab.Navigator> :
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registration" component={Registration} />
        </Stack.Navigator>}
    </NavigationContainer>
  )
}

export default App;
import React from 'react'
import { View, Button, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import { supabase } from '../lib/supabase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../components/Profile'

const Tab = createBottomTabNavigator();

function Feed({navigation}){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
    <View>
        <Text>This is your News Feed</Text>
    </View>
  )
}

export default Feed
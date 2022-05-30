import React from 'react'
import { View, Button, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import { supabase } from '../lib/supabase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


function Listings({navigation}){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
    <View>
      <Text>You will search for listings/post listings here</Text>
    </View>
  )
}

export default Listings
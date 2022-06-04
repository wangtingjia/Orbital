import React from 'react'
import { View, Button, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import { supabase } from '../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();


function CreateListing({route, navigation}) {
  return (
    <View>
      <Text> Start your sports activity here </Text>
    </View>
  )
}

function SearchListing ({route, navigation}) {
  return (
    <View>
      <Text> Search for sports activity here </Text> 
    </View>
    
  )
}

function Listings({navigation}){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
    <Tab.Navigator> 
      <Tab.Screen name="Initiate activity" component ={CreateListing} />
      <Tab.Screen name="Search activities" component ={SearchListing} />
    </Tab.Navigator>
  )
}

export default Listings
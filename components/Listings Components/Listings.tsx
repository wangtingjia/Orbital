import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';
import CreateListing from './CreateListings'
import SearchListing from './SearchListings'
import MyListing from './MyListings'

const Tab = createMaterialTopTabNavigator();

function Listings(){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
    <Tab.Navigator> 
      <Tab.Screen name="Initiate activity" component ={CreateListing} />
      <Tab.Screen name="Search activities" component ={SearchListing} />
      <Tab.Screen name="My activities" component={MyListing} />
    </Tab.Navigator>
  )
}

export default Listings

const styles = StyleSheet.create({
  container: {
      marginTop: 40,
      padding: 12,
  },
  verticallySpaced: {
      paddingTop: 5,
      paddingBottom: 5,
      alignSelf: "stretch",
      fontWeight: "bold",
      color: "grey"
  },
  row_data: {
      paddingTop: 10,
      paddingBottom: 10,
      alignSelf: "stretch",
      fontWeight: "bold",
      borderRadius: 4,
      borderColor: "#172343",
      backgroundColor: "#F5DEB3",
      marginHorizontal: 15,
      marginVertical: 20,
  },
  mt20: {
      marginTop: 20,
  },
});
import React from 'react'
import { View, StyleSheet, Button, Text } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import { supabase } from '../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const styles = StyleSheet.create({
  profileImage:{
      width:200,
      height:200,
  },
  container:{
      flex:1,
  },
});

const Tab = createMaterialTopTabNavigator();


function CreateListing({route, navigation}) {
  return (
    return (
      <View>
          <Text>You can edit your profile here</Text>
          <View>
              <Input label="Name of Sport" value={username}
                  autoCompleteType={undefined} onChangeText={(text)=>setName(text)} />
          </View>
          <View>
              <Input label="Biography" value={biography}
                  autoCompleteType={undefined} onChangeText={(text)=>setBiography(text)} />
          </View>
          <View>
              <Input label="Profile Photo URL" value={avatar_url}
                  autoCompleteType={undefined} onChangeText={(text)=>setAvatarUrl(text)} />
          </View>
          <View>
              <Button
                  title={loading ? "Loading ..." : "Update"}
                  onPress={() => updateProfile({ username, avatar_url, biography })}
                  disabled={loading}
              />
          </View>
      </View>
  )
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
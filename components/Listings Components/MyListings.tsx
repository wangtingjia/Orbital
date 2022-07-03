import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, TouchableHighlight } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';
import { confirmAlert } from 'react-confirm-alert';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MemberInGroup } from './ListofMembers';
import { MyProfile } from '../Profile/Profile';
import { SportsProfile } from '../Profile/SportsProfile';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function MyListing(){
  function checking(){
    console.log(supabase.auth.session())
  }
  return (
        <Tab.Navigator> 
          <Tab.Screen name="Member Listings" component ={MemberListing} />
          <Tab.Screen name="Your Listings" component={OwnerStackScreen} />
        </Tab.Navigator>
  )
}

function OwnerStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Owner Listings" component={OwnerListing}/>
      <Stack.Screen name="Member Details" component={MemberInGroup}/>
      <Stack.Screen name="Member profile" component={MyProfile}/>
      <Stack.Screen name="User Sport Interests" component={SportsProfile} />
    </Stack.Navigator>
  )
}

function MemberListing() {
  const [MyData, setMyData] = useState<Object[] | null> ()

  const FetchData = async () =>  {
    const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");
    
      const { data, error } = await supabase 
        .from('listings')
        .select('id, GroupName, Description, all_members')
        .contains('all_members',[user.id])
        if (error) {
          throw error;
        }
        setMyData(data)
  }
        
  if (MyData) {
    return( 
      <ScrollView>
        {
          MyData.map((data, index) => {
            return (
              <View style={styles.row_data} key ={index}>
                <Text> GroupName: {data.GroupName} </Text>
                <Text> Sport: {data.Sport} </Text> 
                <Text> Description: {data.Description} </Text>
              </View>    
            )
          })
        }
        <Button title = 'Refresh' style={styles.bottom} onPress ={() => FetchData()}/>
      </ScrollView>
      )
    }
    else {
      return (
        <View>
          <Text>No current listings</Text>
          <Button title = 'Refresh' style={styles.bottom} onPress ={() => FetchData()}/>
        </View>
      )
    }
}

function OwnerListing ({navigation}) {
    const [MyData, setMyData] = useState<Object[] | null> ()

    async function DeleteMembers(input_id) {
      const {data , error} = await supabase
      .from('member_list')
      .delete()
      .match({sport_id : input_id})
    }
  
    async function DeleteListing(input_id) {
      console.log(input_id)
      DeleteMembers(input_id)
      const { data, error } = await supabase
      .from('listings')
      .delete()
      .match({ id: input_id })
      FetchListings()
    }
  
    useEffect(() => {
      FetchListings()
    }, [])
  
    const FetchListings = async () =>  {
      const user = supabase.auth.user();
        if (!user) throw new Error("No user on the session!");
    
      const { data, error } = await supabase 
        .from('listings')
        .select('id, owner_id, GroupName, Sport, Description')
        .match ({owner_id : user.id})
        if (error) {
          throw error;
        }
        setMyData(data)
    }

    function confirm_delete(id) {
      return (
        Alert.alert(
          "Confirm delete",
          "Confirm Delete",
          [
            {
              text: "Yes",
              onPress: () => DeleteListing(id)
            },
            {
              text: "No",
              onPress: () => console.log("cancel delete")
            }
          ]
        
        )
      )
  };
        

    if (MyData) {
      return(
        <ScrollView>
          {
            MyData.map((data, index) => {
              return (
                <TouchableHighlight onPress = {() => navigation.navigate('Member Details', {input_id : data.id})}>
                  <View style={styles.row_data} key={index}>
                    <Text> GroupName: {data.GroupName} </Text>
                    <Text> Sport: {data.Sport} </Text> 
                    <Text> Description: {data.Description} </Text>
                  <Button title='Delete' onPress = {() => {confirm_delete(data.id)}}/> 
                  </View>               
                </TouchableHighlight>
              )
            })
          }
            <Button title = 'Refresh' style={styles.bottom} onPress ={() => FetchListings()}/>
        </ScrollView>
      )
    }
    else {
      return (
        <View>
          <Text>No current listings</Text>
        </View>
      )
    }
  }

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
    bottom: {
        position: 'absolute',
        bottom: 0,
        fontWeight: 'bold',
        color: 'grey'
    }
});
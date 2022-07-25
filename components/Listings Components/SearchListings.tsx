import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert} from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';

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
        marginHorizontal: 5,
        marginVertical: 5,
    },
    mt20: {
        marginTop: 20,
    },
});

export default function SearchListing () {
    const [MyData, setMyData] = useState<Object[] | null> ()
    const [MyInput, setMyInput] = useState('')
    const [username, setUsername] = useState("")

    useEffect(()=>{
      getUsername()
    },[])

    async function getUsername(){
      let {data, error} = await supabase.from("profiles").select("username").match({id: supabase.auth.session()?.user.id}).single()
      setUsername(data.username);
    }

    async function GetListingbyGroupName(input) {
      const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description')
      .match({GroupName : input})
      if (error) {
        throw error;
      }
      setMyData(data)
    }
  
    async function GetListingbySport(input) {
      const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description')
      .match({Sport : input})
      if (error) {
        throw error;
      }
      setMyData(data)
    }
    
    async function GetAllListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, owner_id, GroupName, Sport, Description')
      if (error) {
        throw error;
      }
      setMyData(data)
    }

    async function update_listing(SportIdKey) {
      const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");

      let { data, error } = await supabase
        .from('listings')
        .select('id, all_members, members')
        .match({ id: SportIdKey })
        .single()
        if (error) {
          console.log(error)
        }
        else {
          console.log(data)
          let { error } = await supabase
            .from('listings')
            .update({ all_members: [...data.all_members,user.id], members: [...data.members,{uuid:user.id, username: username}] },{ returning: "minimal" })
            .match({ id: SportIdKey})
            .single();
            
          if (error) {
            throw error;
          }
        }
      }
      

    async function add_member(SportIdKey) {
      try {
          const user = supabase.auth.user();
          if (!user) throw new Error("No user on the session!");
      
          const updates = {
              user_id: user.id,
              sport_id: SportIdKey
          };
      
          let { error } = await supabase
              .from("member_list")
              .upsert(updates, { returning: "minimal" });
      
          if (error) {
          throw error;
          }
      
      } catch (error) {
          alert((error as ApiError).message);
      }
    }

    function confirm_join(SportIdKey) {
      return (
        Alert.alert(
          "Confirm to join group",
          "Confirm to join group",
          [
            {
              text: "Yes",
              onPress: () => {
                update_listing(SportIdKey)
                add_member(SportIdKey)
              }
            },
            {
              text: "No",
              onPress: () => console.log("cancel join group")
            }
          ]
        
        )
      )
    }

    async function check_owner (SportIdKey) {
      const user = supabase.auth.user();
          if (!user) throw new Error("No user on the session!");

      const { data, error} = await supabase 
        .from('listings')
        .select('id, owner_id')
        .match({owner_id : user.id, id: SportIdKey})
      
        if(error) {
          throw(error)
        }
        else {
          return data.length ? true : false
        }
    }

    async function check_membership(SportIdKey) {
      const user = supabase.auth.user();
          if (!user) throw new Error("No user on the session!");
      
      let IsOwner = await check_owner(SportIdKey)

      const { data, error } = await supabase
        .from('member_list')
        .select('id, user_id, sport_id')
        .match({sport_id : SportIdKey, user_id : user.id})

        console.log(data)
        if (error) {
          throw error;
        }
        if (IsOwner) {
          alert("error: you are the owner of this group")
        }
        else if (data.length) {
          alert("error: you are in this group")
        }
        else {
          confirm_join(SportIdKey)
        }
    }

    if (MyData) {
      return (
        <ScrollView>
          <View style={styles.verticallySpaced}>
            <Input
              label="Your input: "
              value={MyInput || ""}
              onChangeText={(text) => setMyInput(text)}
              autoCompleteType={undefined} />
              <Button title = 'Search by groupname' onPress = {() => GetListingbyGroupName(MyInput)}/>
              <Button title = 'Search by sport ' onPress = {() => GetListingbySport(MyInput)}/>
              <Button title = 'Show all listings' onPress = {() => GetAllListing()}/>
          </View>
          {
          MyData.map((data, index) => {
            return (
              <View style={styles.row_data} key = {index}>
                  <Text> GroupName: {data.GroupName} </Text>
                  <Text> Sport: {data.Sport} </Text> 
                  <Text> Description: {data.Description}</Text>
                  <Button title = 'Join group' onPress = { () => check_membership(data.id) } />
              </View> 
            )
          })
          }
        </ScrollView>
      )
    }
    else {
      return (
        <ScrollView>
          <View style={styles.verticallySpaced}>
            <Input
              label="Your input: "
              value={MyInput || ""}
              onChangeText={(text) => setMyInput(text)}
              autoCompleteType={undefined} />
              <Button title = 'Search by groupname' onPress = {() => GetListingbyGroupName(MyInput)}/>
              <Button title = 'Search by sport ' onPress = {() => GetListingbySport(MyInput)}/>
              <Button title = 'Show all listings' onPress = {() => GetAllListing()}/>
          </View>
        </ScrollView>
      )
    }
  }
import { useEffect, useReducer, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, TouchableHighlight, FlatList } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import { Session, ApiError } from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';
import { confirmAlert } from 'react-confirm-alert';
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { MemberInGroup } from './ListofMembers';
import { MyProfile } from '../Profile/Profile';
import { SportsProfile } from '../Profile/SportsProfile';
import { useTheme } from 'react-navigation';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function MyListing() {
  function checking() {
    console.log(supabase.auth.session())
  }
  return (
    <Tab.Navigator>
      <Tab.Screen name="Member Listings" component={MemberListingStack} />
      <Tab.Screen name="Your Listings" component={OwnerStackScreen} />
    </Tab.Navigator>
  )
}

function OwnerStackScreen() {
  return (
    <Stack.Navigator options={{ headerTopInsetEnabled: false }}>
      <Stack.Screen name="Owner Listings" component={OwnerListing} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="Member Details" component={MemberInGroup} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="Member Profile" component={MyProfile} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="User Sport Interests" component={SportsProfile} options={{ headerTopInsetEnabled: false }} />
    </Stack.Navigator>
  )
}

function MemberListingStack() {
  return (
    <Stack.Navigator options={{ headerTopInsetEnabled: false }}>
      <Stack.Screen name="Member Listings" component={MemberListing} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="Member Details" component={MemberInGroup} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="Member Profile" component={MyProfile} options={{ headerTopInsetEnabled: false }} />
      <Stack.Screen name="User Sport Interests" component={SportsProfile} options={{ headerTopInsetEnabled: false }} />
    </Stack.Navigator>
  )
}

function MemberListing({ navigation }) {
  const [MyData, setMyData] = useState<Object[] | null>()

  const FetchData = async () => {
    const user = supabase.auth.user();
    if (!user) throw new Error("No user on the session!");

    const { data, error } = await supabase
      .from('listings')
      .select('id, GroupName, Description, all_members, owner_id')
      .contains('all_members', [user.id])
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  function leaveGroupConfirmation(item) {
    return Alert.alert("Confirmation", "Are you sure you want to leave group " + item.GroupName + "?", [
      {
        text: "Yes",
        onPress: () => leaveGroup(item)
      },
      {
        text: "No",
        onPress: () => console.log("cancel leave")
      }
    ])
  }

  async function leaveGroup(item) {
    let user = supabase.auth.user()
    const { data, error } = await supabase
      .from('listings')
      .select('members, all_members')
      .match({ id: item.id })
      .single()

    console.log(data)
    if (error) {
      throw (error)
    } else {
      let newMembers = data.members.filter((item) => {
        return (item.uuid != user.id)
      })
      console.log(newMembers)
      let newMembersID = data.all_members.filter((item) => {
        return (item != user.id)
      })
      console.log(newMembersID)
      let { error } = await supabase.from("listings").update({ members: newMembers, all_members: newMembersID }).match({ id: item.id }).single()
      if (!error) {
        const { data, error } = await supabase
          .from('member_list')
          .delete()
          .match({ sport_id: item.id, user_id: user?.id })
      }
      await FetchData()
      console.log(error)
    }
  }

  return (
    <View>
      <FlatList data={MyData} renderItem={({ item, index }) => (
        <View>
          {item.owner_id != supabase.auth.user().id && <TouchableHighlight underlayColor="#F5DEB3"
            onLongPress={() => leaveGroupConfirmation(item)}
            onPress={() => { navigation.navigate('Member Details', { input_id: item.id, owner: false }) }} style={styles.row_data} key={index}>
            <View>
              <Text> GroupName: {item.GroupName} </Text>
              <Text> Sport: {item.Sport} </Text>
              <Text> Description: {item.Description} </Text>
            </View>
          </TouchableHighlight>}
        </View>
      )} />
      <Button title='Refresh' style={styles.bottom} onPress={() => FetchData()} />
    </View>
  )
}

function OwnerListing({ navigation }) {
  const [MyData, setMyData] = useState<Object[] | null>()

  async function DeleteMembers(input_id) {
    const { data, error } = await supabase
      .from('member_list')
      .delete()
      .match({ sport_id: input_id })
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

  const FetchListings = async () => {
    const user = supabase.auth.user();
    if (!user) throw new Error("No user on the session!");

    const { data, error } = await supabase
      .from('listings')
      .select('id, owner_id, GroupName, Sport, Description')
      .match({ owner_id: user.id })
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  function confirm_delete(item) {
    return (
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete group " + item.GroupName + "?",
        [
          {
            text: "Yes",
            onPress: () => DeleteListing(item.id)
          },
          {
            text: "No",
            onPress: () => console.log("cancel delete")
          }
        ]

      )
    )
  };

  return (
    <View>
      <FlatList data={MyData} renderItem={({ item, index }) => (
        <TouchableHighlight underlayColor="#F5DEB3" onPress={() => navigation.navigate('Member Details', { input_id: item.id, owner: true })}
        onLongPress={()=>{confirm_delete(item)}}>
          <View style={styles.row_data} key={index}>
            <Text> GroupName: {item.GroupName} </Text>
            <Text> Sport: {item.Sport} </Text>
            <Text> Description: {item.Description} </Text>
          </View>
        </TouchableHighlight>
      )} />


      <Button title='Refresh' style={styles.bottom} onPress={() => FetchListings()} />
    </View>
  )


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
    marginHorizontal: 5,
    marginVertical: 5,
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
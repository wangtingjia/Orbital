import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from './LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import Select from 'react-select'
import { useUpsert, useSelect } from 'react-supabase';
import { renderNode } from 'react-native-elements/dist/helpers';

const Tab = createMaterialTopTabNavigator();

function CreateListing() {
  const [GroupName, setGroupName] = useState('')
  const [Sport, setSport] = useState('')
  const [Description, setDescription] = useState('')
  const [GroupSize, setGroupSize] = useState('0')
  const [isPrivate, setisPrivate] = useState('')

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false)

  async function generateListing({GroupName,Sport,Description,GroupSize, isPrivate
  }: {
    GroupName: string;
    Sport: string;
    Description: string;
    GroupSize: string;
    isPrivate: string;
  }) {
    try {
      setLoading(true);
      const user = supabase.auth.user();
      if (!user) throw new Error("No user on the session!");
      
      console.log(user.id)

      const updates = {
        user_id: user.id,
        GroupName,
        Sport,
        Description,
        GroupSize,
        isPrivate,
      };

      let { error } = await supabase
        .from("listings")
        .upsert(updates, { returning: "minimal" });

      if (error) {
        throw error;
      }

  } catch (error) {
    alert((error as ApiError).message);
  } finally {
    setLoading(false);
  }
}

  return (
    <ScrollView>
      <View style={styles.verticallySpaced}>
        <Input
          label="Group Name"
          value={GroupName || ""}
          onChangeText={(text) => setGroupName(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Sport"
          value={Sport || ""}
          onChangeText={(text) => setSport(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Description of your activity"
          value={Description || ""}
          onChangeText={(text) => setDescription(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Size of your group"
          value={GroupSize || ""}
          onChangeText={(text) => setGroupSize(text)}
          autoCompleteType={undefined} />
      </View>

      <View style={styles.verticallySpaced}>
        <Text> Private group ?  {isPrivate} </Text>
        <Text> </Text> 
        <Button title = 'Select yes' onPress={() => setisPrivate('yes')} />
        <Button title = 'Select no' onPress={() => setisPrivate('no')} />
        <Text> </Text>
      </View>

      <View>
        <Button
          title={loading ? "Loading ..." : "Create listing"}
          onPress={() => generateListing({ GroupName, Sport, Description, GroupSize, isPrivate})}
          disabled={loading}
        />
      </View>

    </ScrollView>
  )
}

function SearchListing () {
  const [MyData, setMyData] = useState<Object[] | null> ()
  const [MyInput, setMyInput ] = useState('')

  async function GetListingbyGroupName(input) {
    const { data, error } = await supabase
    .from('listings')
    .select('id, user_id, GroupName, Sport, Description')
    .match({GroupName : input})
    if (error) {
      throw error;
    }
    setMyData(data)
  }

  async function GetListingbySport(input) {
    const { data, error } = await supabase
    .from('listings')
    .select('id, user_id, GroupName, Sport, Description')
    .match({Sport : input})
    if (error) {
      throw error;
    }
    setMyData(data)
  }
  
  async function GetAllListing() {
    const { data, error } = await supabase
    .from('listings')
    .select('id, user_id, GroupName, Sport, Description')
    if (error) {
      throw error;
    }
    setMyData(data)
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
            <View style={styles.row_data}>
                <Text> GroupName: {data.GroupName} </Text>
                <Text> Sport: {data.Sport} </Text> 
               <Text> Description: {data.Description}</Text>
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

function MyListing () {
  const [MyData, setMyData] = useState<Object[] | null> ()

  async function DeleteListing(input_id) {
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
      .select('id, user_id, GroupName, Sport, Description')
      .match ({user_id : user.id})
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
              <View style={styles.row_data}>
                <Text> GroupName: {data.GroupName} </Text>
                <Text> Sport: {data.Sport} </Text> 
                <Text> Description: {data.Description} </Text>
                <Button title='Delete' onPress = {() => DeleteListing(data.id)}/> 
              </View>
              
            )
          })
        }
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
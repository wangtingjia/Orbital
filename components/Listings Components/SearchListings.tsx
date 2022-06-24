import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../LoginSignupScreen'
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
        marginHorizontal: 15,
        marginVertical: 20,
    },
    mt20: {
        marginTop: 20,
    },
});

export default function SearchListing () {
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
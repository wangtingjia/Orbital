import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';
import { confirmAlert } from 'react-confirm-alert';

export default function MyListing () {
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
                <View style={styles.row_data}>
                  <Text> GroupName: {data.GroupName} </Text>
                  <Text> Sport: {data.Sport} </Text> 
                  <Text> Description: {data.Description} </Text>
                  <Button title='Delete' onPress = {() => {confirm_delete(data.id)}}/> 
                </View>
                
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


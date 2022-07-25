import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, FlatList, ScrollView, Alert, TouchableHighlight } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PrivateChat from './ChatPage'

const Stack = createNativeStackNavigator();

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

function DisplayAllChats({navigation}) {
    const [buddyList, setBuddyList] = useState([]);

    useEffect(() => {
        GetBuddyList();
    }, [])

    async function GetBuddyList () {
        const { data, error } = await supabase.from("profiles").select("friend_list").match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        setBuddyList(data.friend_list);
        console.log(buddyList)
    }
    return (
        <View style={styles.row_data}>
        <ScrollView>
            <FlatList
                data={buddyList}
                renderItem={({ item, index }) => (
                    <View>
                        <Text>{item.username}</Text>
                        <Button title="Enter Chat" onPress={() => navigation.navigate("Private chat", {receiver : item.userID, name : item.username})} />
                    </View>
                )}/>
        </ScrollView>
        </View>
    )
}

export default function AllChats () {
    return (
        <Stack.Navigator>  
            <Stack.Screen name="All chats" component={DisplayAllChats} />
            <Stack.Screen options={{headerTitle: 'All Chats', headerBackVisible:true}} name="Private chat" component={PrivateChat} />
        </Stack.Navigator>
    )
}
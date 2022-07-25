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

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export function MemberInGroup({route, navigation}) {

    const [Members, setMembers] = useState<Object[] | null> ()

    async function FetchMembers(SportIdKey) {
        const {data, error} = await supabase 
            .from('listings')
            .select('all_members, id')
            .match({id : SportIdKey})
            .single()
        if (error) {
            throw(error)
        }
        setMembers(data)
    }

    FetchMembers(route.params.input_id)
    
    if (Members) {
        return (
            <ScrollView style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {
                Members.all_members.map((data, index) => {
                    return (
                        <TouchableHighlight onLongPress={() => 
                            navigation.navigate("Member profile", {uuid: data, visitor: true})}>
                            <View style = {styles.row_data} key={index}>
                            <Text> {data} </Text>
                            </View>
                        </TouchableHighlight>
                    )
                })
            }
            </ScrollView>
        )
    }
    else {
        return(<Text> No current members</Text>)
    }
}

export function ListofMembers () {
    return (
        <Stack.Navigator>
            <Stack.Screen name = "MemberInGroup" component = {MemberInGroup} />
        </Stack.Navigator>
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
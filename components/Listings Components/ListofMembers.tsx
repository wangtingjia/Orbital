import { useEffect, useState } from 'react'
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
import { setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export function MemberInGroup({ route, navigation }) {

    const [Members, setMembers] = useState<Object[] | null>()
    const [membersID, setMembersID] = useState<Object[] | null>()

    useEffect(() => {
        FetchMembers(route.params.input_id)
    }, [])

    async function FetchMembers(SportIdKey) {
        const { data, error } = await supabase
            .from('listings')
            .select('members, all_members')
            .match({ id: SportIdKey })
            .single()
        if (error) {
            throw (error)
        }
        setMembers(data.members)
        setMembersID(data.all_members)
    }

    async function deleteMember(uuid) {
        let newMembers = Members?.filter((item) => {
            return (item.uuid != uuid)
        })
        let newMembersID = membersID?.filter((item) => {
            return (item != uuid)
        })
        let { data, error } = await supabase.from("listings").upsert({ members: newMembers, all_members: newMembersID }).match({ id: route.params.input_id }).single()
        setMembers(newMembers);
        setMembersID(newMembersID);
        if (!error) {
            const { data, error } = await supabase
                .from('member_list')
                .delete()
                .match({ sport_id: route.params.input_id, user_id:uuid })
        }
        console.log(newMembers)
    }

    function toggleOverlay(item) {
        if (item.uuid == supabase.auth.session()?.user.id || !route.params.owner) {
            return;
        }
        Alert.alert("Do you want to remove this user?", item.username, [
            {
                text: "Yes",
                onPress: () => deleteMember(item.uuid)
            }, {
                text: "No",
                onPress: () => console.log("cancel delete member")
            }])
    }

    return (
        <FlatList data={Members} renderItem={({ item, index }) => (
            <TouchableHighlight underlayColor="#F5DEB3" onPress={() => { navigation.navigate("Member Profile", { visitor: true, uuid: item.uuid }) }}
                onLongPress={() => { toggleOverlay(item) }}
                style={styles.row_data}><Text>{item.username}</Text></TouchableHighlight>
        )} />
    )
}

export function ListofMembers() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MemberInGroup" component={MemberInGroup} />
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
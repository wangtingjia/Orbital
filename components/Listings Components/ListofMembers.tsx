import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, TouchableHighlight, FlatList, Dimensions } from "react-native";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from "react-native-screens/native-stack";

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const dimensions = Dimensions.get('window')

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
                .match({ sport_id: route.params.input_id, user_id: uuid })
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
        <View>
            {route.params.is_private == 'yes' && route.params.isOwner && <View style={{marginHorizontal:10}}><Button onPress={() => { navigation.navigate("Join Requests", { groupID: route.params.input_id }) }} title="See Join Requests" /></View>}
            <FlatList data={Members} renderItem={({ item, index }) => (
                <TouchableHighlight underlayColor="#F5DEB3" onPress={() => { navigation.navigate("Member Profile", { visitor: true, uuid: item.uuid }) }}
                    onLongPress={() => { toggleOverlay(item) }}
                    style={styles.row_data}><Text>{item.username}</Text></TouchableHighlight>
            )} />
        </View>
    )
}


export function JoinRequests({ navigation, route }) {
    const [joinRequests, setJoinRequests] = useState<Object[] | null>([])
    const [memberIDList, setMemberIDList] = useState<Object[]>([])
    const [memberList, setMemberList] = useState<Object[]>([])

    useEffect(() => {
        getJoinRequests()
    }, [])

    async function getJoinRequests() {
        let { data, error } = await supabase.from("listings").select("join_requests, all_members, members").match({ id: route.params.groupID }).single()
        if (error) throw error
        else {
            setJoinRequests(data.join_requests)
            setMemberIDList(data.all_members)
            setMemberList(data.members)
            console.log(route.params.groupID)
        }
    }

    async function rejectUser(item) {
        let newJoinRequests = joinRequests?.filter((request) => {
            return request.uuid != item.uuid
        })
        let { data, error } = await supabase.from("listings").update({ join_requests: newJoinRequests }).match({ id: route.params.groupID }).single()
        setJoinRequests(data.join_requests)
        Alert.alert("User "+item.username+" Rejected")
    }

    async function acceptUser(item) {
        let {error} = await supabase.from("listings").update({members: [...memberList, {uuid:item.uuid, username:item.username}], all_members:[...memberIDList,item.uuid]}).match({id:route.params.groupID}).single()
        if (!error){
            let { error } = await supabase
            .from("member_list")
            .upsert({user_id: item.uuid, sport_id: route.params.groupID}, { returning: "minimal" });
            let newJoinRequests = joinRequests?.filter((request) => {
                return request.uuid != item.uuid
            })
            if (!error){
            let { data, error } = await supabase.from("listings").update({ join_requests: newJoinRequests }).match({ id: route.params.groupID }).single()
            setJoinRequests(data.join_requests)
            }
        }
        
        Alert.alert("User "+item.username+ " Added")
    }

    return (
        <View>
            {joinRequests?.length == 0 && <View style={{height: dimensions.height-300, alignItems: "center", justifyContent: "center"}}><Text>No join requests at the moment!</Text></View>}
            <FlatList data={joinRequests} renderItem={({ item, index }) => (
                <View style={[styles.row_data, { alignItems: 'center' }]}>
                    <Text>User {item.username} requested to join on {item.date_requested.substring(0, 10)}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 3 }}>
                        <Button title="View Profile" onPress={() => { navigation.navigate("Member Profile", { uuid: item.uuid, visitor: true }) }} />
                        <Button title="Reject User" onPress={() => { rejectUser(item) }} />
                        <Button title="Accept User" onPress={() => { acceptUser(item) }} />
                    </View>
                </View>
            )} />
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
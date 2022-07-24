import { FlatList, View, Text, Button, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MyProfile } from "../Profile/Profile";
import { SportsProfile } from "../Profile/SportsProfile";
const Stack = createNativeStackNavigator();

function ConnectionRequests({ navigation }) {
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [currUser, setCurrUser] = useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getConnectionRequests();
        });
        return unsubscribe
    }, [navigation])

    useEffect(() => {
        getConnectionRequests();
    }, [updated])

    useEffect(() => {
        getCurrUser();
        console.log(currUser)
    }, [])
    const getCurrUser = async () => {
        let { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.user()?.id }).single()
        if (error) throw error;
        setCurrUser(data.username);
    }

    const getConnectionRequests = async () => {
        const { data, error } = await supabase.from("profiles").select("connection_requests").match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        setConnectionRequests(data.connection_requests);
        console.log(data.connection_requests);
    }

    const GoToProfile = (item) => {
        navigation.navigate("User Profile", { uuid: item.userID, visitor: item.userID == supabase.auth.session()?.user.id ? false : true })
    }

    const UpdateFriendList = async (newFriendDetails, id) => {
        const { data, error } = await supabase.from("profiles").select("friend_list").match({ id: id }).single();
        if (error) {
            throw error;
        } else {
            let { error } = await supabase.from("profiles").update({ friend_list: [...data.friend_list, newFriendDetails] }, { returning: "minimal" }).match({ id: id }).single();
            if (error) {
                throw error;
            }
        }
    }

    const AcceptRequest = async (item, index) => {
        let newFriendDetails = {
            userID: item.userID,
            username: item.username,
            date_added: new Date(),
        };
        await UpdateFriendList(newFriendDetails, supabase.auth.user()?.id);
        let currUserDetails = {
            userID: supabase.auth.user()?.id,
            username: currUser == "" ? await getCurrUser() : currUser,
            date_added: new Date(),
        }
        await UpdateFriendList(currUserDetails, item.userID);
        let newConnectionRequests = connectionRequests;
        newConnectionRequests.splice(index, 1);
        let { error } = await supabase.from("profiles").update({ connection_requests: newConnectionRequests }, { returning: "minimal" }).match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        setUpdated(!updated);

        Alert.alert("Successfully connected with " + item.username)
    }

    const RejectRequest = async (item, index) => {
        let newConnectionRequests = connectionRequests;
        newConnectionRequests.splice(index, 1);
        let { error } = await supabase.from("profiles").update({ connection_requests: newConnectionRequests }, { returning: "minimal" }).match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        setUpdated(!updated);
        Alert.alert("Successfully rejected " + item.username)
    }

    return (
        <View>
            <FlatList
                data={connectionRequests}
                renderItem={({ item, index }) => (
                    <View>
                        <View style={{paddingBottom: 10}}><Text>Request to connect from {item.username} on {item.dateRequested.substring(0, 10)}</Text></View>
                        <View style={{paddingBottom: 10}}><Button title="Accept" onPress={() => AcceptRequest(item, index)} /></View>
                        <View style={{paddingBottom: 10}}><Button title="Reject" onPress={() => RejectRequest(item, index)} /></View>
                        <View style={{paddingBottom: 10}}><Button title="View User" onPress={() => GoToProfile(item)} /></View>
                        <Text></Text>
                    </View>
                )}
            />
        </View>
    )
}

export default function ConnectionRequestStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Connection Request" component={ConnectionRequests} options={{ headerShown: false }} />
            <Stack.Screen name="User Profile" component={MyProfile} />
            <Stack.Screen name="User Sport Interests" component={SportsProfile} />
        </Stack.Navigator>
    )
}
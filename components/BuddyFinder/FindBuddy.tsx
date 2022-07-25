import { View, Button, Alert, FlatList, Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Dropdown } from "react-native-element-dropdown";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { MyProfile } from "../Profile/Profile";
import { SportsProfile } from "../Profile/SportsProfile";

const Stack = createNativeStackNavigator();

function FindBuddy({ navigation }) {
    const [userList, setUserList] = useState([])
    const [selectedSport, setSelectedSport] = useState("")
    const [currUser, setCurrUser] = useState("")

    useEffect(() => {
        const getCurrUser = async () => {
            let { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.user()?.id }).single()
            if (error) throw error;
            setCurrUser(data.username);
        }
        getCurrUser();
    }, [])
    const getCurrUser = async () => {
        let { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.user()?.id }).single()
        if (error) throw error;
        setCurrUser(data.username);
    }
    const GetUserList = async () => {
        if (selectedSport == "") {
            Alert.alert("Please select a sport");
            return;
        }
        let { data, error } = await supabase.from(selectedSport).select();
        if (error) throw error;
        setUserList(data);
    }

    const GoToProfile = (item) => {
        navigation.navigate("User Profile", { uuid: item.id, visitor: item.id == supabase.auth.session()?.user.id ? false : true })
    }

    const CheckIfFriends = async (id) => {
        const { data, error } = await supabase.from("profiles").select("friend_list").match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        let currFriendList = data.friend_list;
        let alreadyFriends = false;
        currFriendList.forEach(element => {
            if (element.userID == id) alreadyFriends = true;
            return;
        });
        return alreadyFriends
    }

    const Connect = async (id) => {
        let alreadyFriends = await CheckIfFriends(id);
        if (alreadyFriends) {
            Alert.alert("You are already connected");
            return;
        }
        const { data, error } = await supabase.from("profiles").select("connection_requests").match({ id: id }).single();
        console.log(currUser)
        if (data) {
            let currConnectionRequests = data.connection_requests;
            let requested = false;
            currConnectionRequests.forEach(element => {
                if (element.userID == supabase.auth.user()?.id) {
                    requested = true;
                    return;
                }
            });
            if (requested) {
                Alert.alert("You have already sent a request");
                return;
            }
            let newConnectionRequest = {
                userID: supabase.auth.user()?.id,
                username: currUser == "" ? await getCurrUser() : currUser,
                dateRequested: new Date(),
            }
            let newConnectionRequests = [...data.connection_requests, newConnectionRequest]
            const { error } = await supabase.from("profiles").update({ connection_requests: newConnectionRequests }, { returning: "minimal" }).match({ id: id }).single();
            if (error) throw error;
        }
        if (error) throw error;
        Alert.alert("Request to connect sent!")
    }

    return (
        <View>
            <Dropdown
                data={sports}
                placeholder={"Select Sport"}
                labelField="label"
                valueField="value"
                onChange={item => {
                    setSelectedSport(item.label);
                }} />
            <Button title="Search" onPress={() => GetUserList()} />
            <Text></Text>
            <FlatList
                data={userList}
                renderItem={({ item, index }) => (
                    <View>
                        {item.id != supabase.auth.user()?.id && <View>
                            <Text>Username: {item.username}</Text>
                            <Text>Skill Level: {item.skill_level}</Text>
                            <Text>Experience: {item.experience}</Text>
                            <View style={{paddingBottom:10}}><Button title="See User Profile" onPress={() => GoToProfile(item)} /></View>
                            <View style={{paddingBottom:10}}><Button title="Connect" onPress={() => Connect(item.id)} /></View>
                            <Text></Text>
                        </View>}
                    </View>
                )}
            />
        </View>
    )


}

export default function FindBuddyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Search" component={FindBuddy} options={{ headerShown: false }} />
            <Stack.Screen name="User Profile" component={MyProfile} options={{headerTopInsetEnabled: false}} />
            <Stack.Screen name="User Sport Interests" component={SportsProfile} options={{headerTopInsetEnabled: false}}/>
        </Stack.Navigator>
    )
}

var sports = [
    {
        value: 1,
        label: 'volleyball'
    },
    {
        value: 2,
        label: 'soccer'
    },
    {
        value: 3,
        label: 'basketball'
    },
]
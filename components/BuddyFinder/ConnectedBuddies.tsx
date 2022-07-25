import { useEffect, useState } from "react";
import { View, FlatList, Text, Button, Alert, Dimensions, TouchableHighlight } from "react-native";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { supabase } from "../../lib/supabase";
import { Overlay } from "react-native-elements";
import { MyProfile } from "../Profile/Profile";
import { SportsProfile } from "../Profile/SportsProfile";

const Stack = createNativeStackNavigator();
const dimensions = Dimensions.get("window")

function ConnectedBuddies({ navigation }) {
    const [buddyList, setBuddyList] = useState([]);
    useEffect(() => {
        GetBuddyList();

    }, [])
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            GetBuddyList();
        });
        return unsubscribe
    }, [navigation])
    const AsyncAlert = () => {
        return new Promise((resolve, reject) => {
            Alert.alert(
                'Confirmation',
                'Are you sure you want to delete this user?',
                [
                    { text: 'YES', onPress: () => resolve('YES') },
                    { text: 'NO', onPress: () => resolve('NO') }
                ],
                { cancelable: false }
            )
        })
    }

    const GetBuddyList = async () => {
        const { data, error } = await supabase.from("profiles").select("friend_list").match({ id: supabase.auth.user()?.id }).single();
        if (error) throw error;
        setBuddyList(data.friend_list);
        console.log(buddyList)
    }

    const GoToChat = async (item) => {
        Alert.alert("Chat functionality has yet to be implemented");
    }

    const UpdateFriendList = async (idFrom, id) => {
        const { data, error } = await supabase.from("profiles").select("friend_list").match({ id: idFrom }).single();
        if (error) {
            throw error;
        } else {
            let newFriendList = data.friend_list.filter((item) => {
                return item.userID != id;
            })
            let { error } = await supabase.from("profiles").update({ friend_list: newFriendList }, { returning: "minimal" }).match({ id: id }).single();
            if (error) {
                throw error;
            }
        }
    }
    const RemoveBuddy = async (item, index) => {
        const userResponse = await AsyncAlert()
        if (userResponse == "YES") {
            await UpdateFriendList(item.userID, supabase.auth.session()?.user.id);
            await UpdateFriendList(supabase.auth.session()?.user.id, item.userID);
            Alert.alert("Successfully deleted " + item.username);
            await GetBuddyList();
        }

    }
    return (
        <View>
            {!buddyList.length && <View style={{ height: dimensions.height - 300, alignItems: "center", justifyContent: "center" }}>
                <TouchableHighlight underlayColor="grey" onPress={() => { navigation.navigate("Search") }}><Text style={{ color: "blue" }}>Head over to search to send out some connection requests!</Text></TouchableHighlight></View>}
            <FlatList
                data={buddyList}
                style={{paddingTop:10}}
                renderItem={({ item, index }) => (
                    <View style={{ paddingBottom: 10, marginHorizontal: 10, backgroundColor: "#F5DEB3" }}>
                        <Text>Username: {item.username}</Text>
                        <Text>Added on: {item.date_added.substring(0, 10)}</Text>
                        <View style={{ paddingBottom: 10 }}><Button title="Remove Buddy" onPress={() => RemoveBuddy(item, index)} /></View>
                        <View style={{ paddingBottom: 10 }}><Button title="View Profile" onPress={() => navigation.navigate("User Profile", { uuid: item.userID, visitor: item.userID == supabase.auth.session()?.user.id ? false : true })} /></View>
                    </View>
                )}
            />
        </View>
    )
}

export default function ConnectedBuddiesStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Buddies List" component={ConnectedBuddies} options={{ headerShown: false }} />
            <Stack.Screen name="User Profile" component={MyProfile} options={{ headerTopInsetEnabled: false }} />
            <Stack.Screen name="User Sport Interests" component={SportsProfile} options={{ headerTopInsetEnabled: false }} />
        </Stack.Navigator>
    )

}
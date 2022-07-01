import { useEffect, useState } from "react";
import { View, FlatList, Text, Button, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConnectedBuddiesChat from "./ConnectedBuddiesChat";
import { supabase } from "../../lib/supabase";
import { Overlay } from "react-native-elements";

const Stack = createNativeStackNavigator();

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
            <FlatList
                data={buddyList}
                renderItem={({ item, index }) => (
                    <View>
                        <Text>{item.username}</Text>
                        <Button title="Enter Chat" onPress={() => GoToChat(item)} />
                        <Button title="Remove Buddy" onPress={() => RemoveBuddy(item, index)} />
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
            <Stack.Screen name="Chat" component={ConnectedBuddiesChat} />
        </Stack.Navigator>
    )

}
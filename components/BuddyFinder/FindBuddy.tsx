import { View, Button, Alert, FlatList, Text } from "react-native";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Dropdown } from "react-native-element-dropdown";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MyProfile } from "../Profile/Profile";
import { SportsProfile } from "../Profile/SportsProfile";

const Stack = createNativeStackNavigator();

function FindBuddy({navigation}){
    const [userList, setUserList] = useState([])
    const [selectedSport, setSelectedSport] = useState("")

    const GetUserList = async () => {
        if (selectedSport == ""){
            Alert.alert("Please select a sport");
            return;
        }
        let {data , error} = await supabase.from(selectedSport).select();
        if (error) throw error;
        setUserList(data);
    }

    const GoToProfile = (item) => {
        navigation.navigate("User Profile", { uuid: item.id, visitor: item.commenterID == supabase.auth.session()?.user.id ? false : true })
    }

    const Connect = (id) => {
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
                <Button title="Search" onPress={()=>GetUserList()}/>
                <FlatList
                data={userList}
                renderItem={({ item, index }) => (
                    <View>
                        <Text>Username: {item.username}</Text>
                        <Text>Skill Level: {item.skill_level}</Text>
                        <Text>Experience: {item.experience}</Text>
                        <Button title="See User Profile" onPress={()=> GoToProfile(item)}/>
                        <Button title="Connect" onPress={()=> Connect(item.id)}/>
                    </View>
                )}
            />
        </View>
    )

    
}

export default function FindBuddyStack(){
    return (
        <Stack.Navigator>
            <Stack.Screen name="Search" component={FindBuddy} options={{ headerShown: false }} />
            <Stack.Screen name="User Profile" component={MyProfile} />
            <Stack.Screen name="User Sport Interests" component={SportsProfile} />
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
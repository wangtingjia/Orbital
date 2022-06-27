import { FlatList, View, Text } from "react-native";
import { Overlay, Button, Input } from "react-native-elements";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function SportsProfile({ navigation, route }) {
    const [sportsList, setSportsList] = useState([]);
    const [userID, setUserID] = useState("");
    const [ownerID, setOwnerID] = useState("");

    useEffect(()=>{
        setUserID(supabase.auth.user()?.id);
        setOwnerID(route.params.id);
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getSportsList();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        getSportsList();
    }, [ownerID])

    const getSportsList = async () => {
        let { data, error } = await supabase.from("profiles").select("sports_list").match({ id: route.params.visitor ? ownerID : supabase.auth.user()?.id}).single();
        if (error) {
            throw error;
        } else {
            setSportsList(data.sports_list);
        }
    }

    return (
        <View>
            <FlatList
                data={sportsList}
                renderItem={({ item, index }) => (
                    <View>
                        <Text>I play {item.sportName} and my skill level is {item.skillLevel}</Text>
                        <Text>{item.experience}</Text>
                        {!route.params.visitor && <Button title="Edit Interest" onPress={()=> navigation.navigate("Add Sports", {skillLevel: item.skillLevel, experience:item.experience, disable: true, selectedSport: item.sportName, sportsList:sportsList})}/>}
                        <Text></Text>
                    </View>
                )}
            />
            <View>
                {!route.params.visitor && <Button title="Add Sport" onPress={() => navigation.navigate("Add Sports", { skillLevel: null, experience: "", disable: false, selectedSport: "", sportsList:sportsList})} />}
            </View>
        </View>
    )
}
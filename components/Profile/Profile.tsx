import { View, Text, Alert, StyleSheet, Image } from "react-native";
import { Input, Button } from "react-native-elements"
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Session, ApiError } from "@supabase/supabase-js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { decode } from 'base64-arraybuffer';
import { EditProfile } from "./EditProfile";
import { SportsProfile } from "./SportsProfile";
import { NewsFeed } from "../NewsFeed/Feed";
import Comments from "../NewsFeed/Comments";
import AddSport from "./AddSport";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
const styles = StyleSheet.create({
    profileImage: {
        width: 200,
        height: 200,
    },
    container: {
        flex: 1,
    },
});

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export function MyProfile({ route, navigation }) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const [avatar_url, setAvatarUrl] = useState("");
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        if (route.params.visitor) {
            getProfile(route.params.uuid);
        } else {
            setSession(supabase.auth.session());
            if (session) getProfile("");
        }
    }, [session, route.params.visitor]);

    useEffect(() => {
        if (route.params.visitor){
            return;
        }
        const unsubscribe = navigation.addListener('focus', () => {
            getProfile("");
        });
        return unsubscribe;
    }, [navigation]);

    async function signOut() {
        supabase.auth.signOut();
    }

    async function getProfile(uuid) {
        try {
            setLoading(true);
            const user = supabase.auth.user();
            if (!user) throw new Error("No user on the session!");

            let { data, error, status } = await supabase
                .from("profiles")
                .select(`username, avatar_url, biography`)
                .eq("id", route.params.visitor ? route.params.uuid : user.id)
                .single();
                console.log("here");
            if (error && status !== 406) {
                throw error;
            }
            console.log(data);
            if (data) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url + '?' + new Date());
                setBiography(data.biography);
            }
        } catch (error) {
            Alert.alert((error as ApiError).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View>
            <Image style={styles.profileImage} source={{ uri: avatar_url + "?" + new Date() || "https://i.stack.imgur.com/l60Hf.png" }} />
            {!route.params.visitor && <View>
                <Input label="Email" value={session?.user?.email} disabled
                    autoCompleteType={undefined} />
            </View>}
            <View>
                <Input label="Username" value={username} disabled
                    autoCompleteType={undefined} />
            </View>
            <View>
                <Input label="Biography" value={biography} disabled
                    autoCompleteType={undefined} />
            </View>
            {!route.params.visitor &&
                <View>
                    <Button title="Edit Profile" onPress={() => navigation.navigate("Edit Profile")} />
                    <Button title="See My Posts" onPress={() => navigation.navigate("My Posts", { viewOwnPost: true })} />
                    <Button title="See Sports Interests" onPress={() => navigation.navigate("Sports Interests", {id: supabase.auth.user().id, visitor: false})} />
                    <Button title="Sign Out" onPress={() => signOut()} />
                </View>}
                {route.params.visitor && <Button title="See Sports Interests" onPress={() => navigation.navigate("User Sport Interests", {id:route.params.uuid, visitor:true})} />}
        </View>
    )
}

export function ProfileStack({ navigation }) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="My Profile" component={MyProfile} initialParams={{ visitor: false, uuid: "" }} />
            <Stack.Screen name="Edit Profile" component={EditProfile} />
            <Stack.Screen name="My Posts" component={NewsFeed} />
            <Stack.Screen name="Comments" component={Comments} />
            <Stack.Screen name="Sports Interests" component={SportsProfile} />
            <Stack.Screen name="Add Sports" component={AddSport} />
        </Stack.Navigator>
    )
}

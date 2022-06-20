import {View, Text, Alert, StyleSheet, Image} from "react-native";
import {Input, Button} from "react-native-elements"
import {useEffect, useState} from "react";
import { supabase } from "../lib/supabase";
import {Session, ApiError} from "@supabase/supabase-js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { launchCamera, launchImageLibrary} from "react-native-image-picker";
import {decode} from 'base64-arraybuffer';
import { EditProfile } from "./EditProfile";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
const styles = StyleSheet.create({
    profileImage:{
        width:200,
        height:200,
    },
    container:{
        flex:1,
    },
});

const Stack = createNativeStackNavigator();

function MyProfile({route, navigation}){
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const [avatar_url, setAvatarUrl] = useState("");
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        setSession(supabase.auth.session());
        if (session) getProfile();
    }, [session]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getProfile();
        });
        return unsubscribe;
    }, [navigation]);
    
    async function signOut(){
        supabase.auth.signOut();
    }

    async function getProfile() {
        try {
            setLoading(true);
            const user = supabase.auth.user();
            if (!user) throw new Error("No user on the session!");

            let { data, error, status } = await supabase
                .from("profiles")
                .select(`username, avatar_url, biography`)
                .eq("id", user.id)
                .single();
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
            <Text>This is Your Profile Page</Text>
            <Image style={styles.profileImage} source={{uri:avatar_url+"?"+ new Date() || "https://i.stack.imgur.com/l60Hf.png"}} />
            <View>
                <Input label="Email" value={session?.user?.email} disabled
                    autoCompleteType={undefined} />
            </View>
            <View>
                <Input label="Username" value={username} disabled 
                    autoCompleteType={undefined} />
            </View>
            <View>
                <Input label="Biography" value={biography} disabled
                    autoCompleteType={undefined} />
            </View>
            <Button title="Edit Profile" onPress={() => navigation.navigate("Edit Profile")} />
            <Button title="Sign Out" onPress={() => signOut()}/>
        </View>
    )
}

export function ProfileStack({navigation}){
    return (
        <Stack.Navigator>
            <Stack.Screen name="My Profile" component={MyProfile} />
            <Stack.Screen name="Edit Profile" component={EditProfile} />
        </Stack.Navigator>
    )
}

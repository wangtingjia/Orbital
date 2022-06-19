import {View, Text, Alert, StyleSheet, Image} from "react-native";
import {Input, Button} from "react-native-elements"
import {useEffect, useState} from "react";
import { supabase } from "../lib/supabase";
import {Session, ApiError} from "@supabase/supabase-js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


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

function EditProfile({route, navigation}){
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const [avatar_url, setAvatarUrl] = useState("https://i.stack.imgur.com/l60Hf.png");
    const [session, setSession] = useState<Session | null>(null);
    const {email, usernameJSON, biographyJSON, avatar_urlJSON} = route.params;

    useEffect(() => {
        setUsername(JSON.stringify(usernameJSON));
        setBiography(JSON.stringify(biographyJSON));
        setAvatarUrl(JSON.stringify(avatar_urlJSON));
    },[]);

   useEffect(() => {
        setSession(supabase.auth.session());
        if (session) getProfile();
    }, [session]);

    async function updateProfile({
        username,
        avatar_url,
        biography,

    }: {
        username: string;
        avatar_url: string;
        biography: string;
    }) {
        try {
            setLoading(true);
            const user = supabase.auth.user();
            if (!user) throw new Error("No user on the session!");

            const updates = {
                id: user.id,
                username,
                biography,
                updated_at: new Date(),
            };

            let { error } = await supabase
                .from("profiles")
                .upsert(updates, { returning: "minimal" });

            if (error) {
                throw error;
            }
        } catch (error) {
            Alert.alert((error as ApiError).message);
        } finally {
            setLoading(false);
        }
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

            if (data) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
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
            <Text>You can edit your profile here</Text>
            <Image style={styles.profileImage} source={{uri:avatar_url}} />
            <View>
                <Input label="Email" value={session?.user?.email}
                    autoCompleteType={undefined} disabled/>
            </View>
            <View>
                <Input label="Username" value={username}
                    autoCompleteType={undefined} onChangeText={(text)=>setUsername(text)} />
            </View>
            <View>
                <Input label="Biography" value={biography}
                    autoCompleteType={undefined} onChangeText={(text)=>setBiography(text)} />
            </View>
            <View>
                <Input label="Profile Photo URL" value={avatar_url}
                    autoCompleteType={undefined} onChangeText={(text)=>setAvatarUrl(text)} />
            </View>
            <View>
                <Button
                    title={loading ? "Loading ..." : "Update"}
                    onPress={() => updateProfile({ username, avatar_url, biography })}
                    disabled={loading}
                />
            </View>
        </View>
    )
}

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
                setAvatarUrl(data.avatar_url);
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
            <Image style={styles.profileImage} source={{uri:avatar_url || "https://i.stack.imgur.com/l60Hf.png"}} />
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
            <Button title="Edit Profile" onPress={() => navigation.navigate("Edit Profile", {
                email: session?.user?.email,
                username: username,
                biography: biography,
                avatar_url: avatar_url,
            })} />
            <Button title="Sign Out" onPress={() => signOut()}/>
            <Button title="Testing" onPress={()=>console.log("test")}/>
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

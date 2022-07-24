import { View, Text, Alert, StyleSheet, Image, Platform } from "react-native";
import { Input, Button, Overlay } from "react-native-elements"
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Session, ApiError } from "@supabase/supabase-js";
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

const styles = StyleSheet.create({
    profileImage: {
        width: 200,
        height: 200,
    },
    container: {
        flex: 1,
    },
});

export function EditProfile({ route, navigation, update }) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const [avatar_url, setAvatarUrl] = useState("");
    const [session, setSession] = useState<Session | null>(null);
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
    }, []);

    async function uploadImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            const ext = result.uri.substring(result.uri.lastIndexOf("."), +1);
            const fileName = session.user.id + ".png";
            var formData = new FormData();
            formData.append("files", {
                uri: result.uri,
                name: fileName,
                type: 'image/png',
            })
            await supabase.storage.from('avatars').remove([fileName]);
            const { data, error } = await supabase.storage
                .from("avatars")
                .upload(fileName, formData, {
                    upsert: true
                });
            if (data) await getImage();
            console.log(error);
        }
    };

    async function getImage() {
        const fileName = session?.user.id + ".png";
        const { data, error } = supabase.storage.from('avatars').getPublicUrl(fileName);
        console.log(data);
        if (data) {
            await updateAvatar(data.publicURL);
            setAvatarUrl(data.publicURL + '?' + new Date());
        }
    }

    useEffect(() => {
        setSession(supabase.auth.session());
        if (session) getProfile();
    }, [session]);

    async function updateAvatar(
        avatar_url
    ) {
        try {
            setLoading(true);
            const user = supabase.auth.user();
            if (!user) throw new Error("No user on the session!");

            const updates = {
                id: user.id,
                avatar_url: avatar_url,
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
            setVisible(true);
        }
    }

    async function updateProfile({
        username,
        biography,

    }: {
        username: string;
        biography: string;
    }) {
        try {
            setLoading(true);
            const user = supabase.auth.user();
            if (!user) throw new Error("No user on the session!");

            const updates = {
                id: user.id,
                username: username,
                biography: biography,
                updated_at: new Date(),
                set: true,
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
            setVisible(true);
            route.params.update(false);
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
            <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
                <Text>Update Saved!</Text>
                <Button title="ok" onPress={()=>setVisible(false)}/>
            </Overlay>
            <View style={{alignItems:'center'}}>
            <Image style={styles.profileImage} source={{ uri: avatar_url || "https://i.stack.imgur.com/l60Hf.png" }} />
            </View>
            <View>
                <Input label="Email" value={session?.user?.email}
                    autoCompleteType={undefined} disabled />
            </View>
            <View>
                <Input label="Username" value={username}
                    autoCompleteType={undefined} onChangeText={(text) => setUsername(text)} />
            </View>
            <View>
                <Input label="Biography" value={biography}
                    autoCompleteType={undefined} onChangeText={(text) => setBiography(text)} />
            </View>
            <View style={{paddingBottom: 10}}>
                <Button
                    title={loading ? "Loading ..." : "Save Updates"}
                    onPress={() => updateProfile({ username, biography })}
                    disabled={loading}
                />
            </View>
            <View style={{paddingBottom: 10}}>
                <Button
                    title="Upload Profile Photo"
                    onPress={() => uploadImage()} />
            </View>
        </View>
    )
}

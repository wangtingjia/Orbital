import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert, TextInput, FlatList, TouchableHighlight, Dimensions } from "react-native";
import { Input, Overlay } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../Authentication/LoginSignupScreen'
import { Session, ApiError } from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';

const dimensions = Dimensions.get("window")

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 5,
        paddingBottom: 5,
        alignSelf: "stretch",
        fontWeight: "bold",
        color: "grey"
    },
    sender_data: {
        paddingTop: 3,
        paddingBottom: 3,
        paddingRight: 0,
        alignSelf: "stretch",
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#F5DEB3",
        marginHorizontal: 15,
        marginVertical: 20,
    },
    receiver_data: {
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "stretch",
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#FFC0CB",
        marginHorizontal: 15,
        marginVertical: 20,
    },
    mt20: {
        marginTop: 20,
    },
    bottom: {
        flex: 1
    }
});

export default function PrivateChat({ route, navigation }) {
    const [UserMessage, SetUserMessage] = useState('')
    const [Messages, setMessages] = useState<Object[] | null>()
    const [updated, setUpdated] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(-1);

    const user = supabase.auth.user();
    if (!user) {
        Alert.alert('no user on session')
        throw (console.error())
    }

    const receiverID = route.params.receiver
    const receiver_name = route.params.name
    const senderID = user.id

    async function sendMessage(sender, receiverID) {
        const new_message = {
            created_at: new Date(),
            sender_id: sender,
            receiver_id: receiverID,
            message: UserMessage
        }
        if (UserMessage == '') {
            Alert.alert("no empty messages")
        }
        else {
            let { error } = await supabase
                .from("messages")
                .upsert(new_message, { returning: "minimal" });
            if (error) {
                throw error;
            }
        }
        SetUserMessage("")
        setUpdated(!updated)
    }
    async function deleteMessage(itemID) {
        const { data, error } = await supabase
            .from("messages")
            .delete().match({ id: itemID }).single();
        console.log(data)
        setUpdated(!updated)
        toggleVisibility(-1)
    }

    function toggleVisibility(itemID) {
        setSelectedMessage(itemID)
        setVisible(!visible)
    }

    async function getMessages(senderID, receiverID) {
        const { data, error } = await supabase
            .from("messages")
            .select("created_at, sender_id, receiver_id, message, id")
            .or(`and(sender_id.eq.${senderID},receiver_id.eq.${receiverID}),and(sender_id.eq.${receiverID},receiver_id.eq.${senderID})`)
        if (error) {
            throw (error)
        }
        data.reverse()
        console.log(data)
        setMessages(data)
    }
    useEffect(() => {
        getMessages(senderID, receiverID)
    }, [updated])

    return (
        <View>
            <FlatList inverted={true} data={Messages} horizontal={false} style={{ height: dimensions.height - 200 }} renderItem={({ item, index }) => (
                <View>
                    <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
                        <Text>Do you want to delete this message?</Text>
                        <Button title="Yes" onPress={() => deleteMessage(selectedMessage)} />
                        <Button title="No" onPress={() => toggleVisibility(-1)} />
                    </Overlay>
                    {item.sender_id == senderID ?
                        <View style={{ borderColor: "black", borderWidth: 1, borderRadius: 9, flex: 1, alignSelf: 'flex-end', alignItems: 'flex-end', flexWrap: 'wrap', flexDirection: 'row', padding: 10, marginRight: 10, marginBottom: 1, backgroundColor: "green" }}>
                            <TouchableHighlight onLongPress={() => { toggleVisibility(item.id) }} underlayColor="green"><Text style={{ color: "white" }}>{item.message}{'\n'}{item.created_at.substring(0, 10)} {item.created_at.substring(11, 16)} hours</Text></TouchableHighlight>
                        </View>
                        :
                        <View style={{ borderColor: "black", borderWidth: 1, borderRadius: 9, flex: 1, alignSelf: 'flex-start', flexWrap: 'wrap', flexDirection: 'row', padding: 10, marginLeft: 10, backgroundColor: "grey" }}>
                            <TouchableHighlight onPress={() => { }} underlayColor="grey"><Text style={{ color: "white" }}>{item.message}{'\n'}{item.created_at.substring(0, 10)} {item.created_at.substring(11, 16)} hours</Text></TouchableHighlight>
                        </View>}
                </View>
            )} />
            <View style={{ marginHorizontal: 10 }}><TextInput
                style={{ bottom: 0 }}
                placeholder="your message"
                value={UserMessage || ""}
                onChangeText={(text) => SetUserMessage(text)} />
                <Button
                    title={"Send message"}
                    onPress={() => sendMessage(senderID, receiverID)}
                /></View>
        </View>
    )


}
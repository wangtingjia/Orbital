import { useEffect, useState } from 'react'
import { View, StyleSheet, Button, Text, ScrollView, Alert } from "react-native";
import { Input } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import LoginSignupScreen from '../LoginSignupScreen'
import {Session, ApiError} from "@supabase/supabase-js";
import { supabase } from '../../lib/supabase';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ReactDOM from 'react-dom';
import { renderNode } from 'react-native-elements/dist/helpers';

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
    row_data: {
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "stretch",
        fontWeight: "bold",
        borderRadius: 4,
        borderColor: "#172343",
        backgroundColor: "#F5DEB3",
        marginHorizontal: 15,
        marginVertical: 20,
    },
    mt20: {
        marginTop: 20,
    },
});

export default function CreateListing() {
    const [GroupName, setGroupName] = useState('')
    const [Sport, setSport] = useState('')
    const [Description, setDescription] = useState('')
    const [GroupSize, setGroupSize] = useState('0')
    const [isPrivate, setisPrivate] = useState('')
    
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false)
    
    async function generateListing({GroupName,Sport,Description,GroupSize, isPrivate
     }: {
        GroupName: string;
        Sport: string;
        Description: string;
        GroupSize: string;
        isPrivate: string;
    }) {
    try {
        setLoading(true);
        const user = supabase.auth.user();
        if (!user) throw new Error("No user on the session!");
            
        console.log(user.id)
    
        const updates = {
            user_id: user.id,
            GroupName,
            Sport,
            Description,
            GroupSize,
            isPrivate,
         
        };
    
        let { error } = await supabase
            .from("listings")
            .upsert(updates, { returning: "minimal" });
    
        if (error) {
        throw error;
        }
    
    } catch (error) {
        alert((error as ApiError).message);
    } finally {
        setLoading(false);
    }
}

function confirm_create({ GroupName, Sport, Description, GroupSize, isPrivate}) {
    return (
        Alert.alert(
          "Confirm Create",
          "Confirm Create",
          [
            {
              text: "Yes",
              onPress: () => generateListing({ GroupName, Sport, Description, GroupSize, isPrivate})
            },
            {
              text: "No",
              onPress: () => console.log("cancel create listing")
            }
          ]
        
        )
    )
}
    
return (
        <ScrollView>
            <View style={styles.verticallySpaced}>
            <Input
                label="Group Name"
                value={GroupName || ""}
                onChangeText={(text) => setGroupName(text)}
                autoCompleteType={undefined} />
            </View>
    
            <View style={styles.verticallySpaced}>
            <Input
                label="Sport"
                value={Sport || ""}
                onChangeText={(text) => setSport(text)}
                autoCompleteType={undefined} />
            </View>
    
            <View style={styles.verticallySpaced}>
            <Input
                label="Description of your activity"
                value={Description || ""}
                onChangeText={(text) => setDescription(text)}
                autoCompleteType={undefined} />
            </View>
    
            <View style={styles.verticallySpaced}>
            <Input
                label="Size of your group"
                value={GroupSize || ""}
                onChangeText={(text) => setGroupSize(text)}
                autoCompleteType={undefined} />
            </View>
    
            <View style={styles.verticallySpaced}>
            <Text> Private group ?  {isPrivate} </Text>
            <Text> </Text> 
            <Button title = 'Select yes' onPress={() => setisPrivate('yes')} />
            <Button title = 'Select no' onPress={() => setisPrivate('no')} />
            <Text> </Text>
            </View>
    
            <View>
            <Button
                title={loading ? "Loading ..." : "Create listing"}
                onPress={() => confirm_create({ GroupName, Sport, Description, GroupSize, isPrivate})}
                disabled={loading}
            />
            </View>
    
        </ScrollView>
        )
}
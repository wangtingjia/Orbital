import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FindBuddyStack from "./FindBuddy";
import ConnectedBuddiesStack from "./ConnectedBuddies";
import ConnectionRequestStack from "./ConnectionRequests";


const Tab = createMaterialTopTabNavigator();

export default function BuddyFinding(){
    return (
        <Tab.Navigator>
            <Tab.Screen name="Find Buddy" component={FindBuddyStack}/>
            <Tab.Screen name="Connected Buddies" component={ConnectedBuddiesStack} />
            <Tab.Screen name="Connection Requests" component={ConnectionRequestStack} />
        </Tab.Navigator>
    )
}
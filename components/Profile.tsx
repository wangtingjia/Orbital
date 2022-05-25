import { View, Text, Button, Alert} from "react-native";
import { supabase } from "../lib/supabase";

function Profile({navigation}){

    return (
        <View>
            <Text>This is Your Profile Page</Text>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()}/>
        </View>
    )
}

export default Profile;

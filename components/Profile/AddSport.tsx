import { View, Button } from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { useEffect, useState } from "react";
import { Input } from "react-native-elements";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";
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

var skillLevels = [
    {
        value: 1,
        label: 'total beginner'
    },
    {
        value: 2,
        label: 'intermediate player'
    },
    {
        value: 3,
        label: 'experienced player'
    },
    {
        value: 4,
        label: 'competitive player'
    }
]
export default function AddSport({ navigation, route }) {
    const [selectedSport, setSelectedSport] = useState("");
    const [experience, setExperience] = useState("");
    const [skillLevel, setSkillLevel] = useState("");
    const [currUser, setCurrUser] = useState("");
    const [disable, setDisable] = useState(false);
    const [sportsList, setSportsList] = useState([]);

    useEffect(() => {
        setSkillLevel(route.params.skillLevel);
        setExperience(route.params.experience);
        setSelectedSport(route.params.selectedSport);
        setDisable(route.params.disable);
        setSportsList(route.params.sportsList);
    }, [])

    const getCurrUser = async () => {
        const { data, error } = await supabase.from("profiles")
            .select("username")
            .match({ id: supabase.auth.user()?.id }).single();
        if (data) {
            setCurrUser(data.username);
            return data.username;
        }
        if (error) throw error;
    }

    const CheckAndAdd = async () => {
        if (selectedSport == null) {
            Alert.alert("Please select a sport");
            return;
        }
        if (skillLevel == null) {
            Alert.alert("Please enter your skill level");
            return;
        }
        if (experience == "") {
            Alert.alert("Please give a brief description of your experience in " + selectedSport);
            return;
        }
        let newSport = {
            sportName: selectedSport,
            skillLevel: skillLevel,
            experience: experience
        }
        let updates = {
            skill_level: skillLevel,
            experience: experience,
            updated_at: new Date(),
            username: currUser == "" ? await getCurrUser() : currUser,
            id: supabase.auth.user()?.id,
        };

        let { error } = await supabase.from(selectedSport)
            .upsert(updates, { returning: "minimal" });
        if (error) {
            throw error;
        } else {
            let updatedSportsList = sportsList? sportsList.filter(obj => obj.sportName !== selectedSport) : [];
            let { data, error } = await supabase.from("profiles").update({ sports_list: [...updatedSportsList, newSport] })
                .match({ id: supabase.auth.user()?.id })
            if (error) throw error;
        }
        navigation.goBack();
    }
    return (
        <View>
            <Dropdown
            style={{borderColor:"black", borderWidth:2, borderRadius:2, margin:10}}
                disable={disable}
                data={sports}
                placeholder={disable ? route.params.selectedSport : "Select Sport"}
                labelField="label"
                valueField="value"
                onChange={item => {
                    setSelectedSport(item.label);
                }} />
            <Dropdown
            style={{borderColor:"black", borderWidth:2, borderRadius:2, margin:10 }}
                data={skillLevels}
                placeholder="Select Skill Level"
                labelField="label"
                valueField="value"
                onChange={item => {
                    setSkillLevel(item.value);
                }} />
            <Input label="Experience" value={experience}
                autoCompleteType={undefined} onChangeText={(text) => setExperience(text)} placeholder="Describe your experience in this sport" />
            <View style={{marginHorizontal:10}}><Button title="Add to profile" onPress={() => CheckAndAdd()} /></View>
        </View>
    )
}
import { useEffect, useState } from 'react'
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Button, Overlay } from 'react-native-elements';
import { supabase } from '../../lib/supabase';
import Comments from './Comments';

const styles = StyleSheet.create({
    profileImage: {
      width: 362,
      height: 362,
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
    container: {
      flex: 1,
    },
  });

function Post(props) {
    const [item, setItem] = useState(props.route.params.item);
    const [currUser, setCurrUser] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(()=>{
        setCurrUser(props.route.params.currUser);
        setItem(props.route.params.item);
    },[])

    return (
        <View>
            {item.mediatype == 0 ?
                <View>
                    <Text>test</Text>
                </View>
                :
                <View>
                    <Image style={styles.profileImage} source={{ uri: item.filepublicURL }} />
                </View>
            }
            <View>
               <Text>{item.username}: {item.caption}</Text>
            </View>
            <TouchableOpacity onPress={()=> props.navigation.navigate('Comments', { id: item.id, username: item.username, caption: item.caption, user: currUser})}>
            <Text>See comments</Text>
            </TouchableOpacity>
        </View>
    )

}

export default Post;
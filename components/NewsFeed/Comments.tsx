import { View, Text, FlatList, TouchableOpacity, TouchableHighlight } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button, Input, Overlay } from "react-native-elements";
import { Route } from "react-router-dom";

function Comments(props) {
    const [commentList, setCommentList] = useState<Object[]>([]);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState(props.route.params.user);
    const [updating, setUpdating] = useState(false);
    const [postID, setPostID] = useState(props.route.params.id);
    const [poster, setPoster] = useState(props.route.params.username);
    const [caption, setCaption] = useState(props.route.params.caption);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase.from('image_posts').select('comments').match({ id: postID });
            if (data) {
                if (data[0].comments) setCommentList(data[0].comments);
            }
        }

        fetchComments().catch(console.error);
    }, [updating]);

    const getCurrUser = async () => {
        const { data, error } = await supabase.from("profiles").select("username").match({ id: supabase.auth.session()?.user.id }).single();
        if (data) {
            setUser(data.username);
            return data.username;
        }
    }

    const postComment = async () => {
        const newComment = {
            commenterID: supabase.auth.session()?.user.id,
            commenter: user == "" ? await getCurrUser() : user,
            comment: comment,
        };
        let newComments = [...commentList, newComment];
        //console.log(newComments);
        const { data, error } = await supabase.from('image_posts').update({ comments: newComments }).match({ id: postID });
        setComment("");
        setUpdating(!updating);
    }

    const deleteComment = async (index) => {
        let newComments = commentList.splice(index, 1);
        console.log(newComments);
        const { data, error } = await supabase.from('image_posts').update({ comments: commentList }).match({ id: postID });
        setVisible(false);
    }

    const toggleOverlay = (uuid) => {
        if (uuid == supabase.auth.session()?.user.id) {
            setVisible(true);
        }
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                <TouchableHighlight onPress={() => props.navigation.navigate("User Profile", { uuid: props.route.params.posterID, visitor: props.route.params.posterID == supabase.auth.session()?.user.id ? false : true })} underlayColor="grey"><Text>{poster} : {caption}</Text></TouchableHighlight>
            </View>
            <FlatList
                style={{ height: 400 }}
                initialNumToRender={5}
                data={commentList}
                numColumns={1}
                horizontal={false}

                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                        <Overlay isVisible={visible} onBackdropPress={() => setVisible(false)}>
                            <Text>Do you want to delete this comment?</Text>
                            <Button title="Yes" onPress={() => deleteComment(index)} />
                            <Button title="No" onPress={() => setVisible(false)} />
                        </Overlay>
                        <TouchableHighlight onPress={() => props.navigation.navigate("User Profile", { uuid: item.commenterID, visitor: item.commenterID == supabase.auth.session()?.user.id ? false : true })} underlayColor="grey"><Text>{item.commenter} : </Text></TouchableHighlight>
                        <TouchableHighlight onLongPress={() => toggleOverlay(item.commenterID)} underlayColor="grey"><Text style={{ flexWrap: 'wrap' }}>{item.comment}{"\n"}</Text></TouchableHighlight>
                    </View>
                )}
            />
            <View style={{marginHorizontal:10}}>
                <Input placeholder="your comment" value={comment} autoCompleteType={undefined} onChangeText={(text) => setComment(text)} />
                <Button title="Post comment" onPress={() => postComment()} />
            </View>
        </View>
    )
}

export default Comments;
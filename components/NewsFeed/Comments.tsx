import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button, Input } from "react-native-elements";

function Comments(props) {
    const [commentList, setCommentList] = useState<Object[]>([]);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState(props.route.params.user);
    const [updating, setUpdating] = useState(false);
    const [postID, setPostID] = useState(props.route.params.id);
    const [poster, setPoster] = useState(props.route.params.username);
    const [caption, setCaption] = useState(props.route.params.caption);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase.from('image_posts').select('comments').match({ id: postID });
            if (data) {
                if (data[0].comments) setCommentList(data[0].comments);
            }
        }

        fetchComments().catch(console.error);
    }, [updating]);

    const postComment = async () => {
        const newComment = {
            commenter: user,
            comment: comment,
        };
        let newComments = [...commentList, newComment];
        //console.log(newComments);
        const { data, error } = await supabase.from('image_posts').update({ comments: newComments }).match({ id: postID });
        setUpdating(!updating);
    }

    return (
        <View>
            <Text>{poster} : {caption}</Text>
            <FlatList
                style={{ height: 400 }}
                initialNumToRender={5}
                data={commentList}
                numColumns={1}
                horizontal={false}

                renderItem={({ item, index }) => (
                    <View>
                        <Text>{item.commenter} : {item.comment}{"\n"}</Text>
                    </View>
                )}
            />
            <View>
                <Input label="Type comment" value={comment} autoCompleteType={undefined} onChangeText={(text) => setComment(text)} />
                <Button title="Post comment" onPress={() => postComment()} />
            </View>
        </View>
    )
}

export default Comments;
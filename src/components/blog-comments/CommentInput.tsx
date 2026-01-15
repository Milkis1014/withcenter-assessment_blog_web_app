import { useAppDispatch } from "../../store/hooks";
import { useState } from "react";
import { postComment } from "../../store/slices/commentSlice";
import { useAppSelector } from "../../store/hooks";
const CommentInput = ({ blogId, userId }: { blogId: string; userId: string }) => {
    const [comment, setComment] = useState('')
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()

    const handlePost = async () => {
        if (!comment.trim()) return
        // 
        try {
            await dispatch(postComment({ 
                blog_id: blogId, 
                user_id: userId, 
                content: comment,
                user_email: user?.email || 'Anonymous',
            })).unwrap();
            setComment('')
        } catch (err) {
            alert("Failed to post comment");
        }
    };

    return (
        <div style={styles.addComment}>
            <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                style={styles.commentTextarea}
                />
            <button onClick={handlePost} style={styles.submitComment}>Post Comment</button>
        </div>
    )
    
}

const styles: { [key: string]: React.CSSProperties } = {
    addComment: {
        marginBottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end', // Aligns the button to the right
    },
    commentTextarea: {
        width: '100%',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        minHeight: '80px',
        marginBottom: '10px',
        fontFamily: 'inherit',
    },
    submitComment: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
  },
}

export default CommentInput
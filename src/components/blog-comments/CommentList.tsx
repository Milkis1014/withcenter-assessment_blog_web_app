import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { deleteComment, updateComment } from "../../store/slices/commentSlice";
import { useState } from "react";
const CommentList = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const { comments, loading } = useAppSelector((state) => state.comments);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const handleSave = async (id: string) => {
        if (!editContent.trim()) return;
        await dispatch(updateComment({ id, content: editContent }));
        setEditingId(null);
    }

    const startEditing = (id: string, currentContent: string) => {
        setEditingId(id);
        setEditContent(currentContent);
    }

    const handleDelete = async (commentId: string) => {
        if (window.confirm("Delete this comment?")) {
            await dispatch(deleteComment(commentId));
        }
    }

    if (loading && comments.length === 0) {
        return <p style={styles.loginPrompt}>Loading comments...</p>
    }

    if (comments.length === 0) {
        return <p style={styles.loginPrompt}>No comments yet.</p>
    }

  return (
    <div style={styles.commentsList}>
        {comments.map((c) => (
            <div key={c.id} style={styles.commentItem}>
                <div style={styles.commentHeader}>
                    <small style={styles.commentMeta}>{c.user_email} • {new Date(c.created_at).toLocaleDateString()}</small>
                    {user?.id === c.user_id && (
                        <div style={styles.actions}>
                            <button onClick={() => startEditing(c.id, c.content)} style={styles.editBtn} title="Edit comment">Edit</button>
                            <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn} title="Delete comment">x</button>
                        </div>
                    )}
                </div>

                {editingId === c.id ? (
                    <div style={styles.editContainer}>
                        <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={styles.editTextArea}
                        />
                        <div style={styles.editActions}>
                            <button onClick={() => handleSave(c.id)} style={styles.saveBtn}>Save</button>
                            <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
                        </div>
                    </div>
                ) : (   
                    <p style={styles.commentContent}>{c.content}</p>
                )}
                
            </div>
        ))}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    commentItem: {
        padding: '15px',
        backgroundColor: '#f8f9fa', // Light grey background for each comment
        borderRadius: '6px',
        border: '1px solid #eee',
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between', // This pushes the 'X' to the far right
        alignItems: 'center',
        marginBottom: '8px',
    },
    commentMeta: {
        display: 'block',
        color: '#666',
        fontSize: '12px',
        marginBottom: '8px',
        fontWeight: 'bold',
    },
    deleteBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ff4d4f', // A nice soft red
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '0 5px',
        lineHeight: '1',
        transition: 'color 0.2s',
    },
    commentContent: {
        margin: 0,
        color: '#333',
        lineHeight: '1.5',
        fontSize: '15px',
        whiteSpace: 'pre-wrap', // Keeps line breaks from the textarea
    },
    loginPrompt: {
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '20px 0',
    },
    editBtn: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '12px',
        marginRight: '10px'
    },
    editTextarea: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontFamily: 'inherit',
        marginBottom: '8px'
    },
    editActions: {
        display: 'flex',
        gap: '10px'
    },
    saveBtn: {
        padding: '5px 12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cancelBtn: {
        padding: '5px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
}

export default CommentList
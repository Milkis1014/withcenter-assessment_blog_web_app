import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { deleteComment, updateComment } from "../../store/slices/commentSlice";
import { useState } from "react";
import { uploadCommentImages } from "../../utils/uploadHelper";

const CommentList = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const { comments, loading } = useAppSelector((state) => state.comments);


    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('')
    const [editImages, setEditImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async (id: string) => {
        if (!editContent.trim()) return;
        await dispatch(updateComment({ id, content: editContent, image_urls: editImages }));
        setEditingId(null)
    }

    const startEditing = (id: string, currentContent: string, currentImages: string[]) => {
        setEditingId(id)
        setEditContent(currentContent)
        setEditImages(currentImages || []);
    }

    const handleAddEditFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !user) return;

        setIsUploading(true)
        try {
            const selectedFiles = Array.from(e.target.files)

            const remainingQuota = 5 - editImages.length
            const filesToUpload = selectedFiles.slice(0, remainingQuota)

            if (filesToUpload.length === 0) {
                alert("Maximum of 5 images allowed.")
                return;
            }

            const newUrls = await uploadCommentImages(filesToUpload, user.id)
            setEditImages(prev => [...prev, ...newUrls])
        } catch (error) {
            alert("Upload failed. Please try again.")
        } finally {
            setIsUploading(false);
        }
    }

    const handleRemoveEditImage = (index: number) => {
        setEditImages(prev => prev.filter((_, i) => i !== index))
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
                                <button onClick={() => startEditing(c.id, c.content, c.image_urls)} style={styles.editBtn} title="Edit comment">Edit</button>
                                <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn} title="Delete comment">x</button>
                            </div>
                        )}
                    </div>

                    {editingId === c.id ? (
                        <div style={styles.editContainer}>
                            <textarea 
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={styles.editTextarea} // Matched to style key below
                            />

                                <div style={styles.imageGrid}>
                                    {editImages.map((url, i) => (
                                        <div key={i} style={styles.previewWrapper}>
                                            <img src={url} style={styles.commentImg} alt="edit-preview" />
                                            <button
                                                onClick={() => handleRemoveEditImage(i)}
                                                style={styles.removeBtn}
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}

                                    {editImages.length < 5 && (
                                        <label style={styles.addMoreBtn}>
                                            <span>{isUploading ? "..." : "+ Add"}</span>
                                            <input 
                                                type="file" 
                                                hidden
                                                multiple
                                                accept="image/*"
                                                onChange={handleAddEditFiles}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            

                            <div style={styles.editActions}>
                                <button onClick={() => handleSave(c.id)} style={styles.saveBtn}>Save</button>
                                <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
                            </div>
                        </div>
                    ) : (   
                        /* FIXED: Wrapped in a Fragment */
                        <>
                            <p style={styles.commentContent}>{c.content}</p>
                            
                            {c.image_urls && c.image_urls.length > 0 && (
                                <div style={styles.imageGrid}>
                                    {c.image_urls.map((url: string, index: number) => (
                                        <img 
                                            key={index} 
                                            src={url} 
                                            alt={`Comment attachment ${index + 1}`} 
                                            style={styles.commentImg} 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
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
    imageGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '12px', // Separates text from images
        marginBottom: '12px', // Separate from actions
    },
    commentImg: {
        width: '120px',
        height: '120px',
        objectFit: 'cover', // Ensures images don't stretch
        borderRadius: '4px',
        border: '1px solid #ddd',
        cursor: 'zoom-in', // Suggests images can be clicked/viewed
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
    },
    editContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    previewWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
},
removeBtn: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
},
addMoreBtn: {
    width: '120px',
    height: '120px',
    border: '2px dashed #ccc',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#888',
    backgroundColor: '#fff',
    fontSize: '14px',
    transition: 'all 0.2s ease',
},
}

export default CommentList


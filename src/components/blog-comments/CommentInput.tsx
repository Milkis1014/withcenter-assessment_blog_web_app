import { useAppDispatch } from "../../store/hooks";
import { useState } from "react";
import { postComment } from "../../store/slices/commentSlice";
import { useAppSelector } from "../../store/hooks";
const CommentInput = ({ blogId, userId }: { blogId: string; userId: string }) => {
    const [comment, setComment] = useState('')
    const { user } = useAppSelector((state) => state.auth)
    const { loading } = useAppSelector((state) => state.comments)
    const dispatch = useAppDispatch()

    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files).slice(0, 5); // Hard limit to 5
            setFiles(selected)

            const previewUrls = selected.map(file => URL.createObjectURL(file));
            setPreviews(previewUrls)
        }
    }

    const removeImage = (index: number) => {
        const newFiles = [...files]
        const newPreviews = [...previews]

        URL.revokeObjectURL(newPreviews[index])

        newFiles.splice(index, 1)
        newPreviews.splice(index, 1)

        setFiles(newFiles)
        setPreviews(newPreviews)
    }

    const handlePost = async () => {
        if (!comment.trim() && files.length === 0) return
        // 
        try {
            await dispatch(postComment({ 
                blog_id: blogId, 
                user_id: userId, 
                content: comment,
                user_email: user?.email || 'Anonymous',
                imageFiles: files
            })).unwrap()
            setComment('')
            setFiles([])
            setPreviews([])
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

                {/* File Input */}
                <div style={styles.fileRow}>
                    <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={styles.fileInput}
                    />
                    <span style={styles.fileLimit}>{files.length}/5 images</span>
                </div>

                {previews.length > 0 && (
                    <div style={styles.previewGrid}>
                        {previews.map((url, i) => (
                            <div key={i} style={styles.previewWrapper}>
                                <img src={url} style={styles.previewImg} alt="preview" />
                                <button onClick={() => removeImage(i)} style={styles.removeBtn}>x</button>
                            </div>
                        ))}

                    </div>
                )}
            <button onClick={handlePost} disabled={loading} style={styles.submitComment}>{loading ? 'Posting...' : 'Post Comment'}</button>
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
  fileRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  fileInput: {
    fontSize: '14px',
  },
  fileLimit: {
    fontSize: '12px',
    color: '#666',
  },
  previewGrid: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  previewWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  removeBtn: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px'
  }
}

export default CommentInput
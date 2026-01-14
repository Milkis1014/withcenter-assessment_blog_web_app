import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createBlog } from '../store/slices/blogSlice'

const BlogCreate = () => {
  const [title, setTitle] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [content, setContent] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.blog)
  const { user } = useAppSelector((state) => state.auth)

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...selectedFiles])

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    if (!user) {
      alert('You must be logged in to create a blog')
      navigate('/login')
      return
    }

    try {
      await dispatch(createBlog({ 
        title, 
        content, 
        author_id: user.id,
        imageFiles: images
      })).unwrap()
      navigate('/blogs')
    } catch (err) {
      console.error('Create blog error:', err)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Blog</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Title */}
          <div style={styles.formGroup}>
            <label htmlFor="title" style={styles.label}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter blog title"
            />
          </div>

          {/* Image Upload */}
          <div style={styles.formGroup}>
            <label htmlFor="media" >Add Image</label>
            <input 
              id="media"
              type="file"
              accept='image/*'
              multiple
              onChange={handleFileChange}
              style={styles.input}
            />
            {/* Image Preview */}
            <div style={styles.previewGrid}>
              {previews.map((url, index) => (
                <div key={index} style={styles.previewWrapper}>
                  <img src={url} alt={`preview ${index}`} style={styles.previewImage} />

                  {/* Delete Button Overlay */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={styles.deleteButton}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          

          {/* Content */}
          <div style={styles.formGroup}>
            <label htmlFor="content" style={styles.label}>
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={styles.textarea}
              placeholder="Enter blog content"
              rows={15}
            />
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Blog'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  previewGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '15px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: '10px',
    cursor: 'grab',
    msOverflowStyle: 'none'

  },
  previewWrapper: {
    position: 'relative',
    height: '300px',
    minWidth: '300px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #ddd',
    backgroundColor: '#eee',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(255, 0, 0, 0.7)', // Semi-transparent red
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: 0,
    lineHeight: 1,
    transition: 'background-color 0.2s',
  }
}

export default BlogCreate

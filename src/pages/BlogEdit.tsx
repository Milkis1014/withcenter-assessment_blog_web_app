import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchBlogById, updateBlog, clearCurrentBlog } from '../store/slices/blogSlice'

const BlogEdit = () => {
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentBlog, loading, error } = useAppSelector((state) => state.blog)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(id))
    }
    return () => {
      dispatch(clearCurrentBlog())
    }
  }, [id, dispatch])

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title)
      setContent(currentBlog.content)
    }
  }, [currentBlog])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    if (!id) {
      alert('Blog ID is missing')
      return
    }

    if (!user || currentBlog?.author_id !== user.id) {
      alert('You can only edit your own blogs')
      navigate('/blogs')
      return
    }

    try {
      await dispatch(updateBlog({ id, title, content })).unwrap()
      navigate('/blogs')
    } catch (err) {
      console.error('Update blog error:', err)
    }
  }

  if (loading && !currentBlog) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading blog...</div>
      </div>
    )
  }

  if (!currentBlog) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Blog not found</div>
        <button onClick={() => navigate('/blogs')} style={styles.backButton}>
          Back to Blogs
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Blog</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
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
          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Updating...' : 'Update Blog'}
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
    backgroundColor: '#ffc107',
    color: '#333',
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
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
  },
}

export default BlogEdit

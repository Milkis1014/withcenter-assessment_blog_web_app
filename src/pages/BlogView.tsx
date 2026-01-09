import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchBlogById, deleteBlog, clearCurrentBlog } from '../store/slices/blogSlice'

const BlogView = () => {
  const { id } = useParams<{ id: string }>()
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

  const handleDelete = async () => {
    if (!id) return

    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await dispatch(deleteBlog(id)).unwrap()
        navigate('/blogs')
      } catch (err) {
        console.error('Delete error:', err)
      }
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
        <div style={styles.error}>{error || 'Blog not found'}</div>
        <button onClick={() => navigate('/blogs')} style={styles.backButton}>
          Back to Blogs
        </button>
      </div>
    )
  }

  const canEdit = user && currentBlog.author_id === user.id

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link to="/blogs" style={styles.backLink}>
            ← Back to Blogs
          </Link>
          {canEdit && (
            <div style={styles.actions}>
              <Link to={`/blogs/${id}/edit`} style={styles.editButton}>
                Edit
              </Link>
              <button onClick={handleDelete} style={styles.deleteButton}>
                Delete
              </button>
            </div>
          )}
        </div>
        <h1 style={styles.title}>{currentBlog.title}</h1>
        <div style={styles.meta}>
          <span>Created: {new Date(currentBlog.created_at).toLocaleString()}</span>
          {currentBlog.updated_at !== currentBlog.created_at && (
            <span>Updated: {new Date(currentBlog.updated_at).toLocaleString()}</span>
          )}
        </div>
        <div style={styles.content}>{currentBlog.content}</div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  backLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '16px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginTop: 0,
    marginBottom: '15px',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
    color: '#666',
    fontSize: '14px',
  },
  content: {
    lineHeight: '1.8',
    color: '#333',
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

export default BlogView

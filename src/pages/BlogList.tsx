import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchBlogs,
  setCurrentPage,
  deleteBlog,
} from "../store/slices/blogSlice";
import { signOut } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const BlogList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { blogs, loading, error, totalCount, currentPage, pageSize } =
    useAppSelector((state) => state.blog);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBlogs({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        // Refresh the list if current page becomes empty
        if (blogs.length === 1 && currentPage > 1) {
          dispatch(setCurrentPage(currentPage - 1));
        } else {
          dispatch(fetchBlogs({ page: currentPage, pageSize }));
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Blogs</h1>
        <div style={styles.headerActions}>
          <span style={styles.userEmail}>{user?.email}</span>
          <Link
            to="/blogs/create"
            style={styles.createButton}
          >
            Create Blog
          </Link>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div style={styles.empty}>
          <p>No blogs found. Create your first blog!</p>
          <Link
            to="/blogs/create"
            style={styles.createButton}
          >
            Create Blog
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.blogList}>
            {blogs.map((blog) => (
              <div
                key={blog.id}
                style={styles.blogCard}
              >
                <h2 style={styles.blogTitle}>{blog.title}</h2>
                {blog.image_urls && blog.image_urls.length > 0 && (
                  <img
                    src={blog.image_urls[0]}
                    alt={blog.title}
                    style={styles.singleImage}
                  />
                )}

                <p style={styles.blogContent}>
                  {blog.content.length > 150
                    ? `${blog.content.substring(0, 150)}...`
                    : blog.content}
                </p>
                <div style={styles.blogMeta}>
                  <span style={styles.blogDate}>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                  {blog.updated_at !== blog.created_at && (
                    <span style={styles.blogUpdated}>
                      Updated: {new Date(blog.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div style={styles.blogActions}>
                  <Link
                    to={`/blogs/${blog.id}`}
                    style={styles.viewButton}
                  >
                    View
                  </Link>
                  {user && user.id === blog.author_id && (
                    <>
                      <Link
                        to={`/blogs/${blog.id}/edit`}
                        style={styles.editButton}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 1 ? styles.disabledButton : {}),
                }}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === totalPages ? styles.disabledButton : {}),
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    fontSize: "32px",
    color: "#333",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  userEmail: {
    color: "#666",
    fontSize: "14px",
  },
  createButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontWeight: "500",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  blogList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  blogCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    height: "450px",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  blogTitle: {
    fontSize: "20px",
    color: "#333",
    marginTop: 0,
    marginBottom: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  blogContent: {
    color: "#666",
    lineHeight: "1.6",
    flexGrow: 1,
    marginBottom: "15px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
  },
  blogMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "15px",
    fontSize: "12px",
    color: "#999",
  },
  blogDate: {},
  blogUpdated: {},
  blogActions: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
    paddingTop: "10px",
  },
  viewButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "14px",
  },
  editButton: {
    padding: "8px 16px",
    backgroundColor: "#ffc107",
    color: "#333",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "14px",
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "30px",
  },
  pageButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  pageInfo: {
    color: "#666",
    fontSize: "14px",
  },
  singleImage: {
    width: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
    marginTop: "10px",
    marginBottom: "15px",
    display: "block",
    flexShrink: 0,
  },
};

export default BlogList;

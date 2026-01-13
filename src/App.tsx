import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { getSession } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/Register'
import Login from './pages/Login'
import BlogList from './pages/BlogList'
import BlogCreate from './pages/BlogCreate'
import BlogEdit from './pages/BlogEdit'
import BlogView from './pages/BlogView'
import { supabase } from './lib/supabase'
import { setUser, setSession } from './store/slices/authSlice'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Get initial session
    dispatch(getSession())

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
      dispatch(setUser(session?.user ?? null))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return (
    <BrowserRouter basename='/withcenter-assessment_blog_web_app'>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <BlogList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/create"
          element={
            <ProtectedRoute>
              <BlogCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/:id"
          element={
            <ProtectedRoute>
              <BlogView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/:id/edit"
          element={
            <ProtectedRoute>
              <BlogEdit />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/blogs" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

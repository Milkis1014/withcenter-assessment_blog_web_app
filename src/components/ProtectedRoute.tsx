import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return <div>Checking authentication...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

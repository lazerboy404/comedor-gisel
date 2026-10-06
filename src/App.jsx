import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { isFirebaseConfigured } from './lib/firebase'
import SetupScreen from './components/SetupScreen'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'
import { FullScreenLoader } from './components/Loader'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ToastProvider>
  )
}

function Root() {
  const { user, initializing } = useAuth()

  if (!isFirebaseConfigured) return <SetupScreen />
  if (initializing) return <FullScreenLoader />
  if (!user) return <LoginScreen />
  return <AppShell />
}

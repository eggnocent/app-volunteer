import { BrowserRouter } from 'react-router-dom'

import { RouteProgress } from '@/components/RouteProgress'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AuthProvider } from '@/providers/AuthProvider'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <RouteProgress />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

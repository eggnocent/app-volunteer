import { BrowserRouter } from 'react-router-dom'

import { RouteProgress } from '@/components/RouteProgress'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteProgress />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

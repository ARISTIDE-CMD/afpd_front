import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './routes'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Router>
  )
}

export default App

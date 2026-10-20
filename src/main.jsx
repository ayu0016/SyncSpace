import { StrictMode } from 'react'
import '@fontsource/jetbrains-mono'
import '@fontsource/plus-jakarta-sans'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AllWidget from './components/AllWidget.jsx'
import AddTracker from './pages/AddTracker.jsx'
import store from './store/store.js'
import { Provider } from 'react-redux'
import DSADeepDive from './pages/deepdive/DSADeepDive.jsx'
import GymDeepDive from './pages/deepdive/GymDeepDive.jsx'
import MLDeepDive from './pages/deepdive/MLDeepDive.jsx'
import KanbanDeepDive from './pages/deepdive/KanbanDeepDive.jsx'
import CustomDeepDive from './pages/deepdive/CustomDeepDive.jsx'
import Profile from './pages/Profile.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,  // ✅ always mounted, runs auth listener
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'login', element: <Login /> },
            { path: 'signup', element: <SignUp /> },
            { path: 'forgot-password', element: <ForgotPassword /> },
            { path: 'reset-password', element: <ResetPassword /> },
            {
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: 'dashboard/',
                        element: <Dashboard />,
                        children: [
                            { index: true, element: <AllWidget /> },
                            { path: 'dsa', element: <DSADeepDive /> },
                            { path: 'gym', element: <GymDeepDive /> },
                            { path: 'ml', element: <MLDeepDive /> },
                            { path: 'kanban', element: <KanbanDeepDive /> },
                            { path: 'customDeepDive', element: <CustomDeepDive /> },
                            { path: 'widget/custom/:widgetId', element: <CustomDeepDive /> }
                        ]
                    },
                    { path: 'add-tracker', element: <AddTracker /> },
                    { path: 'profile', element: <Profile /> },
                    {
                        path: 'widget/custom/:widgetId',
                        element: <Dashboard />,
                        children: [
                            { index: true, element: <CustomDeepDive /> }
                        ]
                    },
                ]
            },
        ]
    }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)

import { StrictMode, lazy } from 'react'
import '@fontsource/jetbrains-mono'
import '@fontsource/plus-jakarta-sans'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes.jsx'
import store from './store/store.js'
import { Provider } from 'react-redux'

// ─── Lazy Loaded Route Pages for Code Splitting ────────────────────────────────
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const SignUp = lazy(() => import('./pages/SignUp.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const AllWidget = lazy(() => import('./components/AllWidget.jsx'))
const AddTracker = lazy(() => import('./pages/AddTracker.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const DSADeepDive = lazy(() => import('./pages/deepdive/DSADeepDive.jsx'))
const GymDeepDive = lazy(() => import('./pages/deepdive/GymDeepDive.jsx'))
const MLDeepDive = lazy(() => import('./pages/deepdive/MLDeepDive.jsx'))
const KanbanDeepDive = lazy(() => import('./pages/deepdive/KanbanDeepDive.jsx'))
const CustomDeepDive = lazy(() => import('./pages/deepdive/CustomDeepDive.jsx'))

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

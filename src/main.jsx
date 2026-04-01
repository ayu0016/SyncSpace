import { StrictMode } from 'react'
import '@fontsource/plus-jakarta-sans';
import { createRoot } from 'react-dom/client'
import {store} from "./store/store.js"
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import { RouterProvider } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage.jsx';
import AddTracker from './pages/AddTracker.jsx';




const router= createBrowserRouter(
    [
        {path:"/",element : <LandingPage/>,},
        {path:"/dashboard",element : <Dashboard/>,},
        {path:"/login",element : <Login/>,},
        {path:"/signup",element : <SignUp/>,},
        {path:"/forgot-password",element : <ForgotPassword />,},
        {path:"/reset-password",element : <ResetPassword/>,},
        {path:"/add-tracker",element : <AddTracker/>,},
        
    ]
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)

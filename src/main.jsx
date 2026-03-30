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

const router= createBrowserRouter(
    [
        {path:"/",element : <Dashboard/>,},
        {path:"/login",element : <Login/>,},
        {path:"/signUp",element : <SignUp/>,}
    ]
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)

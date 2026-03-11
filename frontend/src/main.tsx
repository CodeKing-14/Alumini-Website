import { createRoot } from "react-dom/client";
import App from "./app";
import "./style.css";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Header from "./Pages/Header";
import About from "./Pages/About";
import Events from "./Pages/Events";
import Login from "./Pages/Login";
import Gallery from "./Pages/Gallery";
import Member from './Pages/Member';
import ProfilePage from "./Pages/ProfilePage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
          index:true,element:<Header />
        },
        
    ],
  },
 
  {
    path: "/about",
    element:<About/>,
    children: [
        {
            index:true,element: <Header/>  
        }
    ]
  },

  {
    path:"/events",
    element:<Events />,
    children:[
        {
            index:true,element: <Header />
        }
    ]
  },
  {
    path:"/login",
    element:<Login />,
    children:[
        {
            index:true,element:<Header />
        }
    ]
    
  },
  {
    path:"/gallery",
    element:<Gallery />,
    children:[
        {
            index:true,element:<Header />
        }
    ]
  },
  {
    path:"/member",
    element:<Member />,
    children:[
        {
            index:true,element:<Header />
        }
    ]
  },
  {
    path:"/ProfilePage",
    element:<ProfilePage />,
    children:[
        {
            index:true,element:<Header />
        }
    ]
  }

]);

createRoot(document.getElementById("root")!).render(

        <RouterProvider router={router} />
)
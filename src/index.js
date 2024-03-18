import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import Home from './Home';
import Lab from './Lab';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AssignCreate from './AssignCreate';
import AssignEdit from './AssignEdit';
import Homeprof from './Homeprof';
import Sentin from './Sentin';
import AssignList from './AssignList';
import StudentList from './StudentList';
import ClassCreate from './ClassCreate';
import ClassEdit from './ClassEdit';
import Testernaja from './Testernaja';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "Home",
    element: <Home/>,
  },
  {
    path: "Lab",
    element: <Lab/>,
  },
  {
    path: "AssignEdit",
    element: <AssignEdit/>,
  },
  {
    path: "AssignCreate",
    element: <AssignCreate/>,
  },
  {
    path: "Homeprof",
    element: <Homeprof/>,
  },
  {
    path: "Sentin",
    element: <Sentin/>,
  },
  {
    path: "AssignList",
    element: <AssignList/>,
  },
  {
    path: "StudentList",
    element: <StudentList/>,
  },
  {
    path: "ClassCreate",
    element: <ClassCreate/>,
  },
  {
    path: "ClassEdit",
    element: <ClassEdit/>,
  },
  {
    path:"Testernaja",
    element: <Testernaja/>,
  },
  
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    < RouterProvider router={router}/>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

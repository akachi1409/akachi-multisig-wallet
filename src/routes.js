import React from 'react'
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import {
    MainLayout,
    FullLayout,
} from './layouts'

// pages
import NotFound from 'pages/notFound';
import Requests from 'pages/Requests';
import AddSigner from 'pages/AddSigner';
import HouseDetails from 'pages/HouseDetails';

export default function Router() {

    return useRoutes([
        {
            path: '/house',
            element: <MainLayout />,
            children: [
                // { path: 'app', element: <Dashboard /> },
                { path: 'requests', element: <Requests /> },
                { path: 'addSIgner', element: <AddSigner/>}
            ]
        },
        {
            path: '/item',
            element: <MainLayout />,
            children: [
                { path: ':contract/:tokenID', element: <HouseDetails /> },
            ]
        },
       
        {
            path: '/',
            element: <FullLayout />,
            children: [
                { path: '/', element: <Navigate to='/house/requests' /> },
                { path: '404', element: <NotFound /> },
                { path: '*', element: <Navigate to='/404' /> }
            ]
        },
        // { path: '*', element: <Navigate to='/404' replace /> }
    ])
}

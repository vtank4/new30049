import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'; // for layout, grid system, and pre-designed components( buttons, forms, and navigation bars) 
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // for interactive components ( modals, dropdowns, and carousels ) 

// Import common style
import '../src/styles/main.css';
import '../src/styles/component/ScatterPlot.css';

// Import pages
import ErrorPage from './components/ErrorPage';
import HomePage from './pages/HomePage';
import PredictPricePage from './pages/PredictPricePage';
import PredictHistory from './pages/PredictHistory';
import MarketCharts from './pages/MarketCharts';
import AboutUsPage from './pages/AboutUs';  


// Importing specific component used within pages
import ScatterPlotPage from './components/ScatterPlotComponent';

// Setting up routes for different pages in the app
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/predict-price',
    element: <PredictPricePage />
  },
  {
    path: '/predict-history',
    element: <PredictHistory />
  },
  {
    path: '/market-charts',
    element: <MarketCharts />
  },
  {
    path: '/about-us',
    element:  <AboutUsPage />
  }
]);

// Initializing the app by rendering it inside the 'root' element
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

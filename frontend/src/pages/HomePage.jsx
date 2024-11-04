import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/pages/home.css';
import houseLogo from '../assets/house_logo.png';
import marketLogo from '../assets/market_logo.png';
import backgroundSecond from '../assets/background.jpg';
import MLLogo from '../assets/ML_logo.png';
import groupLogo from '../assets/group_logo.png';
import { properties } from '../data/properties';
import { handleScroll } from '../services/formAction';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function HomePage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [propertiesPerColumn, setPropertiesPerColumn] = useState(window.innerWidth < 992 ? 4 : 3);
    const [filters, setFilters] = useState({ type: '', price: '', distance: '' });
    const thirdContentRef = useRef(null);

    useEffect(() => {
        const resizeListener = () => {
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                setPropertiesPerColumn(window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3);
            }, 100);
        };

        window.addEventListener('resize', resizeListener);
        resizeListener();
        return () => window.removeEventListener('resize', resizeListener);
    }, []);

    const priceRanges = {
        "100000 - 300000": [100000, 300000],
        "300000 - 500000": [300000, 500000],
        "500000 - 700000": [500000, 700000],
        "700000 - 900000": [700000, 900000],
        "900000+": [900000, Infinity],
    };

    const distanceRanges = {
        "1-5": [1, 5],
        "6-10": [6, 10],
        "11-20": [11, 20],
        "20+": [20, Infinity],
    };

    const handleFilterChange = (filterName) => (event) => {
        setFilters({ ...filters, [filterName]: event.target.value });
        setCurrentIndex(0);
    };

    const resetFilters = () => setFilters({ type: '', price: '', distance: '' });

    const applyFilters = (property) => {
        const matchesType = !filters.type || property.type === filters.type;
        const [minPrice, maxPrice] = priceRanges[filters.price] || [];
        const matchesPrice = !minPrice || (property.price >= minPrice && property.price <= maxPrice);
        const [minDistance, maxDistance] = distanceRanges[filters.distance] || [];
        const matchesDistance = !minDistance || (property.distance_to_cbd >= minDistance && property.distance_to_cbd <= maxDistance);
        
        return matchesType && matchesPrice && matchesDistance;
    };

    const filteredProperties = properties.filter(applyFilters);

    return (
        <>
            <NavBar />

            {/* Introduction Section */}
            <section className="container-fluid first-content" style={{ padding: 0 }}>
                <div className="about-box text-center mx-auto p-5" style={{ maxWidth: "800px" }}>
                    <h1 className="display-3 text-white fw-bold mb-4" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}>
                        Welcome to UMD Housing Prediction
                    </h1>
                    <p className="lead text-white" style={{ fontSize: "1.25rem", lineHeight: "1.6", textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                        Unlock reliable market insights and tailored property value predictions designed to help you make informed real estate decisions.
                        Whether you’re searching for a home or an investment, we’re here to guide you every step of the way.
                        Explore confidently with UMD Housing Prediction.
                    </p>
                </div>
            </section>

            {/* Get Started Section */}
            <section 
                className="container-fluid second-content" 
                style={{
                    backgroundImage: `url(${backgroundSecond})`,
                    backgroundSize: '100% auto', // Stretch width to fit while maintaining aspect ratio
                    backgroundPosition: 'center', // Center the image
                    backgroundRepeat: 'no-repeat', // Prevent repeating of the image
                    height: 'auto', // Allow height to adjust based on content
                    minHeight: '60vh', // Set a minimum height if needed
                    padding: '20px 0', // Adjust padding as needed
                    margin: 0, // Ensure there's no margin at the top
                    color: 'white'
                }}
            >
                <h1 className="text-center mb-3" style={{ margin: '0' }}>Get Started</h1>
                <div className="row justify-content-center text-center mt-4 mx-auto">
                    {[ 
                        { img: marketLogo, title: 'Market Research', link: 'See Market Charts', to: '/market-charts' },
                        { img: MLLogo, title: 'Get your Predicted Price', link: 'Open AI Predict', to: '/predict-price' },
                        { img: groupLogo, title: 'About Us', link: 'Learn more', to: '/calculator' }
                    ].map((item, idx) => (
                        <div key={idx} className="col-lg-3 col-md-4 col-6 mb-4">
                            <img src={item.img} className="logo" alt={`${item.title}_logo`} />
                            <h5 className="responsive-title black-text">{item.title}</h5> {/* Apply the black-text class */}
                            <p className="d-none d-md-block responsive-text">{item.desc}</p>
                            {item.to ? (
                                <NavLink className="link" to={item.to}>{item.link}</NavLink>
                            ) : (
                                <button className="link" onClick={item.action}>{item.link}</button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Property Filter Section */}
            
            <Footer />
        </>
    );
}

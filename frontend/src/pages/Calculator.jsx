import React from 'react';
import '../styles/pages/aboutUs.css'; // Update the CSS import if necessary
import user1 from '../assets/user_1.png';
import user2 from '../assets/user_2.png';
import user3 from '../assets/user_3.png';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function AboutUs() {
    return (
        <>
            <NavBar />
            <section className="container about-us-section">
                <h1 className="text-center title">About Us - UMD TEAM</h1>
                <p className="intro-text text-center">
                    We are UMD, a team committed to revolutionizing real estate with AI-driven market insights.
                </p>
                <p className="about-description text-center">
                    Welcome to our website, where we leverage the power of Machine Learning to revolutionize real estate decision-making. Our platform is designed to provide users with accurate, data-driven predictions of housing market prices based on a variety of specific property details, such as location, size, amenities, and historical trends.
                </p>
                <p className="about-description text-center">
                    In a world where real estate transactions can be overwhelming, we aim to simplify the process by offering an intuitive, user-friendly interface that guides users through their property assessments. Our predictive models analyze vast amounts of data, enabling buyers, sellers, and real estate professionals to make informed decisions with confidence.
                </p>
                <p className="about-description text-center">
                    Our mission is to bridge the gap between technology and real estate, empowering individuals with the tools they need to understand market dynamics and make smarter investments. We believe that access to accurate information should be available to everyone, whether you're a first-time homebuyer or a seasoned investor.
                </p>
                <p className="about-description text-center">
                    We are committed to continuous improvement and innovation, and we actively seek user feedback to enhance our platform. Join us on this journey to transform the way you approach real estate transactions.
                </p>
                <div className="row team-members">
                    {[{ img: user1, name: 'Phuong Doanh HA', role: 'Cyber Security Analyst, QA Manager' },
                      { img: user2, name: 'Melvin Goxhaj', role: 'AI Software Engineer, QA Manager' },
                      { img: user3, name: 'Upek Malankandalage', role: 'Games Developer, QA Manager' }]
                      .map((user, idx) => (
                        <div key={idx} className="col-lg-4 col-md-6 text-center mb-4 team-member-card">
                            <img src={user.img} alt="team member" className="team-photo" />
                            <h5 className="name">{user.name}</h5>
                            <p className="role">{user.role}</p>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </>
    );
}

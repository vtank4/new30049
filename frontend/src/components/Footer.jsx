import React from 'react';
import '../styles/component/footer.css';

export default function Footer() {
  return (
    <footer className="container-fluid text-center">
      <div className="row">
        <div className="col-12 d-flex flex-column justify-content-center align-items-center pb-2">
          <h4 className="text">Subscribe to our Newsletter</h4>
          <p className="text">Stay updated with our latest news and offers!</p>
          <form className="d-flex justify-content-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="form-control mx-2"
              required
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
        <div className="col-6 d-flex flex-column justify-content-end align-items-center pb-2">
          <h4 className="text">Contact</h4>
          <span className='contact'><i className="fas fa-home me-3"></i> Shepparton, VIC 3630</span>
          <a href="mailto:melvingoxhaj@gmail.com" className='contact text-black'>
            <i className="fas fa-envelope me-3"></i>melvingoxhaj@gmail.com
          </a>
          <p className='contact'><i className="fas fa-phone me-3"></i>0474213341</p>
        </div>
        <div className="col-12 copyright w-100 text-center">
          © {new Date().getFullYear()} All Rights Reserved
          <span className='d-none d-lg-block d-md-block d-sm-block'>| UMD Group | Website by team UMD</span>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="gradient-footer text-white py-5">
      <div className="container">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">FlowSpace</h5>
            <p className="opacity-75">
              Creating beautiful digital experiences with modern design
              solutions for forward-thinking companies.
            </p>
            <div className="d-flex gap-2 mt-4">
              <a href="#" className="social-icon">
                {/* Twitter */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 ..."></path>
                </svg>
              </a>
              <a href="#" className="social-icon">
                {/* GitHub */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 ..."></path>
                </svg>
              </a>
              <a href="#" className="social-icon">
                {/* LinkedIn */}
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 ..."></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">About Us</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Services</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Portfolio</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-bold mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">Blog</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Documentation</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Support</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Newsletter</h6>
            <p className="opacity-75">Stay updated with our latest news and updates.</p>
            <div className="input-group mt-3">
              <input
                type="email"
                className="form-control newsletter-input"
                placeholder="Enter your email"
              />
              <button className="btn btn-light px-4" type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <hr className="my-4 opacity-25" />

        {/* Copyright */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="opacity-75">
              © 2024 FlowSpace. All rights reserved.
            </small>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <a href="#" className="footer-link me-3"><small>Terms</small></a>
            <a href="#" className="footer-link me-3"><small>Privacy</small></a>
            <a href="#" className="footer-link"><small>Cookies</small></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

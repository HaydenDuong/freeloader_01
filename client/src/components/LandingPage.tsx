import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">FreeLoader</div>
        <nav>
          <a href="/help">Help Centre</a>
          <a href="/register">Sign Up</a>
          <a href="/login">Log In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Discover Events. Get Free Stuff.</h1>
        <p>Connecting students with events offering free goods and services.</p>
        <div className="cta-buttons">
          <a href="/register?role=student" className="cta-primary">I'm a Student</a>
          <a href="/register?role=organizer" className="cta-secondary">I'm an Organizer</a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Freeloader?</h2>
        <div className="benefits-container">
          <div className="benefit">
            <h3>For Students</h3>
            <ul>
              <li>Discover events happening around you.</li>
              <li>Get free food, swag, and other goodies.</li>
              <li>Connect with companies and organizations.</li>
            </ul>
          </div>
          <div className="benefit">
            <h3>For Organizers</h3>
            <ul>
              <li>Promote your events to students.</li>
              <li>Increase event attendance.</li>
              <li>Engage with the student community.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up as a student to get started.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Browse Events</h3>
            <p>Find events that interest you.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Free Stuff</h3>
            <p>Attend events and enjoy the perks.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <h2>Ready to Get Started?</h2>
        <div className="cta-buttons">
          <a href="/register" className="cta-primary">Sign Up Now</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </div>
  );
};

export default LandingPage;

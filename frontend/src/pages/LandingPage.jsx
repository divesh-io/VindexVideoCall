import React from 'react';
import './Landing.css';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      <nav className="topNav">
        <div className="brandWrap">
          <div className="brandLogo">V</div>
          <h1 className="navHeader">Vindex</h1>
        </div>

        <div className="navLinks">
          <a href="/">Join</a>
          <a href="/auth">Register</a>
          <Link to="/auth" className="loginButton">
            Login
          </Link>
        </div>
      </nav>

      <div className="mainContainer">
        <div className="mainTextContainer">
          <span className="badge">● HD Video • Secure • Fast</span>

          <h1 className="mainHeader">
            Meet, collaborate, <span>without limits</span>
          </h1>

          <p className="mainText">
            Experience crystal-clear video meetings, smart team collaboration, and
            instant communication with anyone, anywhere in the world.
          </p>

          <div className="ctaGroup">
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/auth"
              className="primaryCta"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/home"
              className="secondaryCta"
            >
              Join Demo Room
            </Button>
          </div>

          <div className="featureRow">
            <div className="miniCard">
              <strong>120ms</strong>
              <span>low latency</span>
            </div>
            <div className="miniCard">
              <strong>HD</strong>
              <span>video quality</span>
            </div>
            <div className="miniCard">
              <strong>24/7</strong>
              <span>team access</span>
            </div>
          </div>
        </div>

        <div className="imageContainer">
          <div className="imageCard">
            <img src="images/call.png" alt="Video Meeting" />
            <div className="floatingBadge floatingBadgeTop">Live meeting</div>
            <div className="floatingBadge floatingBadgeBottom">4 participants</div>
          </div>
        </div>
      </div>
    </div>
  );
}

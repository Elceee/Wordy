import React, { Component } from "react";
import LoginSignUp from "./LoginSignup.jsx";
import "./LoginSignUp.css";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { loginVisable: false };
  }

  flip = () => {
    let newstate = !this.state.loginVisable;
    this.setState({ loginVisable: newstate });
  };

  renderLoginText = () => {
    if (!this.state.loginVisable) {
      return (
        <div className="loginHelperText">
          <p>
            If don't you already have an account sign up here!
            If not click here to log in
          </p>
          <button onClick={this.flip}>Log In</button>
        </div>
      );
    } else
      return (
        <div className="loginHelperText">
          <p>If you don't don't have an account yet click here to make one!</p>
          <button onClick={this.flip}>Sign Up</button>
        </div>
      );
  };

  render = () => {
    return (
      <div className="loginSignUpContainer">
        <div className="title">Welcome to Wordy!</div>
        <div className="loginHolder">
          <div className="slider">
            <div
              className={
                this.state.loginVisable ? "loginBlock visible" : "loginBlock "
              }
            >
              {this.renderLoginText()}
            </div>
          </div>
          <div>
            <LoginSignUp endpoint="/login" name="Login" />
          </div>
          <div>
            <LoginSignUp endpoint="/signup" name="Sign Up" />
          </div>
        </div>
      </div>
    );
  };
}

export default LoginPage;

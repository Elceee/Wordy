import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedLoginSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameInput: "",
      passwordInput: "",
      formType: this.props.endpoint === "/login" ? "Log In" : "Sign Up"
    };
  }

  usernameOnChangeHandler = event => {
    this.setState({ usernameInput: event.target.value });
  };

  passwordOnChangeHandler = event => {
    this.setState({ passwordInput: event.target.value });
  };

  OnSubmit = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.state.usernameInput);
    data.append("password", this.state.passwordInput);
    let response = await fetch(this.props.endpoint, {
      method: "POST",
      body: data
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.props.dispatch({ type: "loginSuccess", username: body.name });
      return;
    } else if (!body.success) {
      alert(body.type);
    }
  };

  render = () => {
    return (
      <div>
        <form onSubmit={this.OnSubmit}>
          <input
            type="text"
            onChange={this.usernameOnChangeHandler}
            value={this.state.usernameInput}
            placeholder="Username"
          ></input>
          <input
            type="text"
            onChange={this.passwordOnChangeHandler}
            value={this.state.passwordInput}
            placeholder="Password"
          ></input>
          <input type="submit" value={this.state.formType}></input>
        </form>
      </div>
    );
  };
}

let LoginSignUp = connect()(UnconnectedLoginSignUp);

export default LoginSignUp;

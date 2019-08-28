import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedSignup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameInput: "",
      passwordInput: ""
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
    data.append("password", this.state.passwordInputInput);
    let response = await fetch("/signup", { method: "POST", body: data });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.props.dispatch({
        type: "loginSuccess",
        username: this.state.usernameInput
      });
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
          <input type="submit" value="Sign Up"></input>
        </form>
      </div>
    );
  };
}

let Signup = connect()(UnconnectedSignup);

export default Signup;

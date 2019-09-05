import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class UnconnectedLogout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  logout = async () => {
    let response = await fetch("/logout");
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.props.dispatch({ type: "logout" });
      this.props.history.push("/");
    }
  };

  render = () => {
    return <div onClick={this.logout}>Logout</div>;
  };
}

let Logout = connect()(withRouter(UnconnectedLogout));

export default Logout;

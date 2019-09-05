import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./LandingPage.css";

class UnconnectedJoinLobby extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  joinRandomGame = async () => {
    let response = await fetch("/joinRandomGame");
    let responseBody = await response.text();
    console.log(responseBody);
    let body = JSON.parse(responseBody);
    this.props.history.push("/conversations/" + body);
  };

  render = () => {
    return (
      <button onClick={this.joinRandomGame} className="landingPageButton">
        Join a random game!
      </button>
    );
  };
}

let JoinLobby = connect()(withRouter(UnconnectedJoinLobby));

export default JoinLobby;

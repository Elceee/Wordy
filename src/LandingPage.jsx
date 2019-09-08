import React, { Component } from "react";
import JoinLobby from "./JoinLobby.jsx";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import RandomWord from "./RandomWord.jsx";
import "./LandingPage.css";

class UnconnectedLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    if (!this.props.checkingForCall) {
      let isBeingCalled = async () => {
        this.props.dispatch({ type: "checkingForCalls" });
        console.log("checking for calls", this.props.username);
        let data = new FormData();
        data.append("username", this.props.username);
        let response = await fetch("/isUserBeingCalled");
        let responseBody = await response.text();
        let body = JSON.parse(responseBody);
        if (body.success) {
          this.props.dispatch({
            type: "incomingCall",
            name: body.caller,
            isCalling: true
          });
        }
        setTimeout(isBeingCalled, 1000);
      };
      setTimeout(isBeingCalled, 1000);
    }
  };
  sendSocial = event => {
    event.preventDefault();
    this.props.history.push("/friends");
  };

  render = () => {
    return (
      <div className="mainContainer">
        <div className="generalInfoContainer one">
          <div className="generalInfoItem">
            <p>
              Welcome to Wordy, a web app which uses the WebRTC API to connect
              you with other word game lovers!
            </p>
            <p>
              The game itself is very simple. You get 10 letters and 30 seconds.
              In that time you have to score as many points as possible. You
              score points for each letter in each word e.g. "hello" is worth 5
              points and "hi" is worth 2 points.
            </p>
          </div>
        </div>
        <div className="generalInfoContainer two">
          <div className="generalInfoItemRow">
            <div className="infoCard">
              If you already have friends who use the site click here to add
              them to your friends list and ask them to chat!
              <button onClick={this.sendSocial} className="landingPageButton">
                Add friends
              </button>
            </div>
            <div className="infoCard">
              If you're just looking to jump into a game with a stranger you can
              click here to join a lobby!
              <JoinLobby />
            </div>

            <RandomWord />
          </div>
        </div>
      </div>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username, checkingForCall: state.checkingForCall };
};

let LandingPage = connect(mapStateToProps)(withRouter(UnconnectedLandingPage));

export default LandingPage;

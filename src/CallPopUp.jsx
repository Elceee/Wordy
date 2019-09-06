import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "./PopUp.css";

class UnconnectedCallPopUp extends Component {
  constructor(props) {
    super(props);
  }

  acceptCall = () => {
    let usernames = [this.props.incomingCaller, this.props.username];
    usernames = usernames.sort();
    let linkName = usernames.join("");
    this.props.history.push("/conversations/" + linkName);
    this.props.dispatch({ type: "incomingCall", name: "", isCalling: false });
  };

  rejectCall = () => {
    this.props.dispatch({ type: "incomingCall", name: "", isCalling: false });
  };

  render = () => {
    if (this.props.incomingCall) {
      return (
        <div className="popup">
          <h4>{this.props.incomingCaller} is calling you</h4>
          <div className="buttonContainer">
            <button className="green" onClick={this.acceptCall}>
              Accept
            </button>
            <button className="red" onClick={this.rejectCall}>
              Decline
            </button>
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  };
}

let mapStateToProps = state => {
  return {
    username: state.username,
    incomingCaller: state.incomingCaller,
    incomingCall: state.incomingCall
  };
};

let CallPopUp = connect(mapStateToProps)(withRouter(UnconnectedCallPopUp));

export default CallPopUp;

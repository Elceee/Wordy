import React, { Component } from "react";
import VideoCall from "./VideoCall.jsx";
import WordGame from "./WordGame.jsx";
import Chat from "./Chat.jsx";
import "./Conversation.css";

class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = { isVideoCallStarted: false };
  }

  startVideoCall = event => {
    this.setState({ isVideoCallStarted: true });
  };

  render = () => {
    if (this.state.isVideoCallStarted) {
      return (
        <div className="conversationContainer">
          <VideoCall id={this.props.id + "videoCall"} />
          <WordGame id={this.props.id} />
          <Chat id={this.props.id} />
        </div>
      );
    }
    if (!this.state.isVideoCallStarted) {
      return (
        <div className="conversationContainer">
          <WordGame id={this.props.id} />
          <Chat id={this.props.id} />
          <button onClick={this.startVideoCall}>Start Video Call</button>
        </div>
      );
    }
  };
}

export default Conversation;

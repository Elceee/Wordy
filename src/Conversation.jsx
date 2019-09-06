import React, { Component } from "react";
import VideoCall from "./VideoCall.jsx";
import WordGame from "./WordGame.jsx";
import Chat from "./Chat.jsx";
import { connect } from "react-redux";
import "./Conversation.css";

class UnconnectedConversation extends Component {
  constructor(props) {
    super(props);
    this.state = { isVideoCallStarted: false };
  }

  componentDidMount = () => {
    let socket = io();
    socket.emit(
      "sendMessage",
      this.props.id,
      `has joined the chat`,
      this.props.username
    );
  };

  componentWillUnmount = () => {
    let socket = io();
    socket.emit(
      "sendMessage",
      this.props.id,
      `has left the chat`,
      this.props.username
    );
  };

  startVideoCall = () => {
    this.setState({ isVideoCallStarted: true });
  };

  render = () => {
    if (this.state.isVideoCallStarted) {
      return (
        <div className="conversationContainer">
          <VideoCall id={this.props.id + "videoCall"} />
          <div className="gameAndChatHolder long">
            <WordGame id={this.props.id} />
            <Chat id={this.props.id} />
          </div>
        </div>
      );
    }
    if (!this.state.isVideoCallStarted) {
      return (
        <div className="conversationContainer">
          <div className="gameAndChatHolder center">
            <WordGame id={this.props.id} />
            <div className="callButtonContainer">
              <p>If you want to video call your opponent click here!</p>
              <button className="green" onClick={this.startVideoCall}>
                Start Video Call
              </button>
            </div>
            <Chat id={this.props.id} />
          </div>
        </div>
      );
    }
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let Conversation = connect(mapStateToProps)(UnconnectedConversation);

export default Conversation;

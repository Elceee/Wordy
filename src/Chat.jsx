import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedChat extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [], chatInput: "" };
  }

  componentDidMount = async () => {
    let socket = io();
    socket.emit("joinChat", this.props.id);
    socket.on("newMessage", data => {
      console.log("got new messages");
      let messages = data.messages;
      this.setState({ messages });
    });
    socket.emit(
      "sendMessage",
      this.props.id,
      `${this.props.username} has joined the chat`,
      this.props.username
    );
  };

  sendMessage = event => {
    event.preventDefault();
    let socket = io();
    socket.emit(
      "sendMessage",
      this.props.id,
      this.state.chatInput,
      this.props.username
    );
    this.setState({ chatInput: "" });
  };

  renderMessages = () => {
    return this.state.messages.map(message => {
      return (
        <div>
          {message.user}: {message.message}
        </div>
      );
    });
  };

  chatOnChangeHandler = event =>
    this.setState({ chatInput: event.target.value });

  render = () => {
    return (
      <div>
        <div>{this.renderMessages()}</div>
        <form onSubmit={this.sendMessage}>
          <input
            type="text"
            onChange={this.chatOnChangeHandler}
            value={this.state.chatInput}
          />
          <input type="submit" value="Send Message" />
        </form>
      </div>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let Chat = connect(mapStateToProps)(UnconnectedChat);

export default Chat;

import React, { Component } from "react";
import { connect } from "react-redux";

class UnconnectedChat extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [], chatInput: "" };
  }

  componentDidMount = async () => {
    let socket = io();
    socket.on("newMessage", data => {
      console.log("got new messages");
      let messages = data.messages;
      this.setState({ messages });
    });
    socket.emit("joinChat", this.props.id);
  };

  componentWillUnmount = () => {
    let socket = io();
    socket.off("newMessage");
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
    let key = 2;
    return this.state.messages.map(message => {
      if (key % 2 === 0) {
        return (
          <div className="even" key={key++}>
            {message.user}: {message.message}
          </div>
        );
      } else {
        return (
          <div className="odd" key={key++}>
            {message.user}: {message.message}
          </div>
        );
      }
    });
  };

  chatOnChangeHandler = event =>
    this.setState({ chatInput: event.target.value });

  render = () => {
    return (
      <div>
        <div>{this.renderMessages()}</div>
        <form className="wordGameForm" onSubmit={this.sendMessage}>
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

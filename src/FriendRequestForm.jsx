import React, { Component } from "react";
import { connect } from "react-redux";
import "./FriendsList.css";

class UnconnectedFriendRequestForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: "",
      userMessage: ""
    };
  }

  userInputOnChangeHandler = event => {
    this.setState({ userInput: event.target.value });
  };

  onSubmitHandler = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("username", this.props.username);
    data.append("friend", this.state.userInput);
    let response = await fetch("/addFriend", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (!body.success) {
      alert(body.type);
    } else if (body.success) {
      this.setState({ userInput: "", userMessage: "Friend Request Sent!" });
    }
  };

  render = () => {
    return (
      <form onSubmit={this.onSubmitHandler}>
        <div>{this.state.userMessage}</div>
        <input
          type="text"
          onChange={this.userInputOnChangeHandler}
          value={this.state.userInput}
          placeholder="Add a friend!"
          className="friendsListText"
        />
        <input type="submit" value="Add Friend"></input>
      </form>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let FriendRequestForm = connect(mapStateToProps)(UnconnectedFriendRequestForm);

export default FriendRequestForm;

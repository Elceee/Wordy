import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import FriendRequestForm from "./FriendRequestForm.jsx";
import "./FriendsList.css";

class UnconnectedFriendsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      pendingFriends: []
    };
  }

  componentDidMount = async () => {
    let username = this.props.username;
    let data = new FormData();
    data.append("username", username);
    let response = await fetch("/getFriends", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    console.log(responseBody);
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.setState({
        friends: body.friends,
        pendingFriends: body.pendingFriends
      });
    }
  };

  callFriend = event => {
    this.props.history.push("/conversations/" + event);
  };

  removeFriend = async friend => {
    let data = new FormData();
    data.append("removedFriend", friend);
    let response = await fetch("removeFriend", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.updateFriendsState();
    }
  };

  updateFriendsState = async () => {
    let username = this.props.username;
    let data = new FormData();
    data.append("username", username);
    let response = await fetch("/getFriends", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.setState({
        friends: body.friends,
        pendingFriends: body.pendingFriends
      });
    }
  };

  acceptFriend = async event => {
    let friendName = event.target.value;
    let username = this.props.username;
    let data = new FormData();
    data.append("friendName", friendName);
    data.append("username", username);
    let response = await fetch("/acceptFriend", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      setTimeout(this.updateFriendsState, 50);
    }
  };

  rejectFriend = async event => {
    let friendName = event.target.value;
    let username = this.props.username;
    let data = new FormData();
    data.append("friendName", friendName);
    data.append("username", username);
    let response = await fetch("/rejectFriend", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.updateFriendsState();
    }
  };

  renderFriendsasLi = () => {
    return this.state.friends.map(friend => {
      let usernames = [friend, this.props.username];
      usernames = usernames.sort();
      let linkName = usernames.join("");
      return (
        <li className="listContainer">
          <div className="nameContainer">{friend}:</div>
          <button
            onClick={() => this.callFriend(linkName)}
            className="greenButton"
          >
            Call
          </button>
          <button
            onClick={() => this.removeFriend(friend)}
            className="redButton"
          >
            Remove Friend
          </button>
        </li>
      );
    });
  };

  renderPendingFriends = () => {
    let pendingFriends = this.state.pendingFriends.filter(friend => {
      return friend.receiver === true;
    });
    return pendingFriends.map(friend => {
      return (
        <li className="listContainer">
          <div className="nameContainer">{friend.user}:</div>
          <button
            onClick={this.acceptFriend}
            value={friend.user}
            className="greenButton"
          >
            Accept
          </button>
          <button
            onClick={this.declineFriend}
            value={friend.user}
            className="redButton"
          >
            Reject
          </button>
        </li>
      );
    });
  };

  renderSentFriendRequests = () => {
    let sentFriendRequests = this.state.pendingFriends.filter(friend => {
      return friend.receiver === false;
    });
    if (sentFriendRequests === []) {
      return (
        <li>
          You don't have any friend requests sent out currently! If you just
          sent one and don't see it here try refreshing the page!
        </li>
      );
    } else {
      return sentFriendRequests.map(friend => {
        return <li>{friend.user}</li>;
      });
    }
  };

  render = () => {
    return (
      <div className="friendsListContainer">
        <div className="acceptedFriends">
          <h2>Your Friends</h2>
          <ul>{this.renderFriendsasLi()}</ul>
        </div>
        <div className="acceptedFriends">
          <h2>Friend Requests</h2>
          <ul>{this.renderPendingFriends()}</ul>
          <FriendRequestForm />
        </div>
        <div>
          <h2>Sent Friend Requests</h2>
          <ul>{this.renderSentFriendRequests()}</ul>
        </div>
      </div>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let FriendsList = connect(mapStateToProps)(withRouter(UnconnectedFriendsList));

export default FriendsList;

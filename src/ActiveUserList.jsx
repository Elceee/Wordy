import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

class UnconnectedActiveUserList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = async () => {
    let data = new FormData();
    data.append("username", this.props.username);
    let response = await fetch("/allUsers", { method: "POST", body: data });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.props.dispatch({ type: "setUsers", users: body.users });
    }
  };

  renderUsersAsLiElems = () => {
    return this.props.users.map(user => {
      let usernames = [user, this.props.username];
      usernames = usernames.sort();
      let linkName = usernames.join("");
      return (
        <div>
          <Link to={"/conversations/" + linkName}>Connect with {user}</Link>
        </div>
      );
    });
  };

  render = () => {
    if (this.props.users === undefined) {
      return <div>...Loading</div>;
    }
    return <div>{this.renderUsersAsLiElems()}</div>;
  };
}

let mapStateToProps = state => {
  return { username: state.username, users: state.users };
};

let ActiveUserList = connect(mapStateToProps)(UnconnectedActiveUserList);

export default ActiveUserList;

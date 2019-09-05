import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, withRouter, Link } from "react-router-dom";
import JoinLobby from "./JoinLobby.jsx";
import FriendsList from "./FriendsList.jsx";
import Conversation from "./Conversation.jsx";
import NavBar from "./NavBar.jsx";
import LandingPage from "./LandingPage.jsx";
import LoginPage from "./LoginPage.jsx";

class UnconnectedApp extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = async () => {
    let response = await fetch("/isUserLoggedIn");
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      this.props.dispatch({ type: "loginSuccess", username: body.username });
    }
  };

  renderLandingPage = () => {
    return <LandingPage />;
  };

  renderConversation = routerdata => {
    let id = routerdata.match.params.id;
    return <Conversation id={id} />;
  };

  renderFriends = () => {
    return <FriendsList />;
  };

  render = () => {
    if (this.props.username === undefined) {
      return <LoginPage />;
    }
    return (
      <BrowserRouter>
        <NavBar />
        <Route path={"/friends"} exact render={this.renderFriends} />
        <Route
          path={"/conversations/:id"}
          exact
          render={this.renderConversation}
        />
        <Route path={"/"} exact render={this.renderLandingPage} />
      </BrowserRouter>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let App = connect(mapStateToProps)(UnconnectedApp);

export default App;

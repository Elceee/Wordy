import React, { Component } from "react";
import VideoCall from "./VideoCall.jsx";
import { connect } from "react-redux";
import LoginSignUp from "./LoginSignup.jsx";
import ActiveUserList from "./ActiveUserList.jsx";
import { BrowserRouter, Route } from "react-router-dom";

class UnconnectedApp extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderLandingPage = () => {
    return <ActiveUserList />;
  };

  renderVideoChat = routerdata => {
    let id = routerdata.match.params.id;
    return <VideoCall id={id} />;
  };

  render = () => {
    if (this.props.username === undefined) {
      return (
        <div>
          <LoginSignUp endpoint="/login" />
          <LoginSignUp endpoint="/signup" />
        </div>
      );
    }
    return (
      <BrowserRouter>
        <Route
          path={"/conversations/:id"}
          exact
          render={this.renderVideoChat}
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

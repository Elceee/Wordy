import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Logout from "./Logout.jsx";
import "./NavBar.css";

class UnconnectedNavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  sendHome = event => {
    event.preventDefault();
    this.props.history.push("/");
  };

  sendSocial = event => {
    event.preventDefault();
    this.props.history.push("/friends");
  };

  render = () => {
    return (
      <div className="NavbarContainer">
        <div className="NavBarNonClickable">
          <div>Welcome {this.props.username}!</div>
        </div>
        <div className="NavBarItem">
          <div onClick={this.sendHome}>Home</div>
        </div>
        <div className="NavBarItem">
          <div onClick={this.sendSocial}>Friends</div>
        </div>
        <div className="NavBarItem">
          <Logout />
        </div>
      </div>
    );
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let NavBar = connect(mapStateToProps)(withRouter(UnconnectedNavBar));

export default NavBar;

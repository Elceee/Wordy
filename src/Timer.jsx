import React, { Component } from "react";

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 30, timerID: "" };
  }
  componentDidMount = () => {
    let decrementTime = () => {
      let newSeconds = this.state.seconds - 1;
      this.setState({ seconds: newSeconds });
    };
    let timer = setInterval(decrementTime, 1000);
    this.setState({ timerID: timer });
  };

  componentWillUnmount = () => {
    clearInterval(this.state.timerID);
  };

  renderTime = () => {
    return this.state.seconds;
  };
  render = () => {
    return <div>{this.renderTime()}</div>;
  };
}

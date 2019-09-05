import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
class RandomWord extends Component {
  constructor(props) {
    super(props);
    this.state = { word: "" };
  }
  componentDidMount = () => {
    let socket = io();
    socket.emit("newWord");
    socket.on("newWord", data => {
      console.log("recieved new word", data.word);
      let word = data.word;
      this.setState({ word });
    });
  };

  render = () => {
    return (
      <div className="infoCard">
        <div>Your random word!</div>
        <h2>{this.state.word}</h2>
        <div>
          Read about {this.state.word}&nbsp;
          <a
            href={"https://en.wiktionary.org/wiki/" + this.state.word}
            target="_blank"
          >
            Here
          </a>
        </div>
      </div>
    );
  };
}

export default RandomWord;

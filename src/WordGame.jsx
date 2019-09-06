import React, { Component } from "react";
import Timer from "./Timer.jsx";
import { connect } from "react-redux";
import "./Conversation.css";

class UnconnectedWordGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      letters: [],
      availableLetters: [],
      submittedWords: [],
      lettersAsObject: {},
      userInput: "",
      gameStart: false,
      gameRunning: false,
      ownScore: 0,
      ownWords: [],
      opponentScore: 0,
      opponentWords: [],
      opponentName: "",
      gameEnded: false,
      userMessage: "To start playing Wordy click begin!"
    };
  }

  componentDidMount = () => {
    this.sendWords = () => {
      socket.emit(
        "submittedWords",
        JSON.stringify(this.props.id),
        JSON.stringify(this.state.submittedWords),
        JSON.stringify(this.props.username)
      );
      this.setState({ gameEnded: true, gameRunning: false });
    };
    let socket = io();
    socket.on("gameStart", () => {
      this.setState({ gameStart: true });
    });
    socket.emit("gameStart", this.props.id);
    socket.on("newLetters", letters => {
      console.log("recieved new letters");
      letters = letters.newLetters;
      let lettersAsObject = {};
      letters.forEach(letter => {
        if (lettersAsObject[letter] === undefined) lettersAsObject[letter] = 1;
        else lettersAsObject[letter] += 1;
      });
      this.setState({
        letters: letters,
        availableLetters: letters,
        lettersAsObject: lettersAsObject,
        gameRunning: true,
        gameStart: true,
        submittedWords: [],
        userMessage: ""
      });
      setTimeout(this.sendWords, 30000);
    });
    socket.on("error", data => {
      alert(data.message);
    });
    socket.on("scoreUpdate", data => {
      let username = data.username;
      let score = data.score;
      let words = data.words;
      if (username !== this.props.username) {
        this.setState({
          opponentScore: score,
          opponentWords: words,
          opponentName: username
        });
        return;
      } else this.setState({ ownScore: score, ownWords: words });
    });
  };

  componentWillUnmount = () => {
    let socket = io();
    socket.off("gameStart");
    socket.off("newLetters");
    socket.off("error");
    socket.off("scoreUpdate");
  };

  sendGameAction = message => {
    console.log("sending game action", message);
    let instruction = message.toString();
    let socket = io();
    socket.emit(instruction, this.props.id);
  };

  renderLetters = () => {
    let key = 0;
    return this.state.availableLetters.map(letter => {
      return (
        <div key={key++} className="letterBox">
          {letter}
        </div>
      );
    });
  };

  textInputOnChangeHandler = event => {
    let valid = true;
    let inputAsArray = event.target.value.toLowerCase().split("");
    let LettersAsObjects = this.state.lettersAsObject;
    let inputAsObject = {};
    let availableLettersAsObject = this.state.lettersAsObject;
    inputAsArray.forEach(letter => {
      if (inputAsObject[letter] === undefined) inputAsObject[letter] = 0;
      inputAsObject[letter] += 1;
    });
    Object.keys(inputAsObject).forEach(letter => {
      if (inputAsObject[letter] > LettersAsObjects[letter]) valid = false;
      if (LettersAsObjects[letter] === undefined) {
        valid = false;
      }
    });
    if (!valid) return;
    let availalbeLettersAsArray = [];
    let calculateAvailableLetters = letter => {
      if (inputAsObject[letter] === undefined) {
        return availableLettersAsObject[letter];
      } else return availableLettersAsObject[letter] - inputAsObject[letter];
    };
    Object.keys(availableLettersAsObject).forEach(letter => {
      for (let x = calculateAvailableLetters(letter); x > 0; x--) {
        availalbeLettersAsArray.push(letter);
      }
    });
    this.setState({
      availableLetters: availalbeLettersAsArray,
      userInput: event.target.value
    });
  };

  onSubmitHandler = event => {
    event.preventDefault();
    let properFormattedWord = this.state.userInput.toLowerCase();
    let userReplies = this.state.submittedWords;
    if (userReplies.includes(properFormattedWord)) {
      this.setState({
        availableLetters: this.state.letters,
        userMessage: "You've already submitted that word!"
      });
      setTimeout(() => {
        this.setState({ userMessage: "" });
      }, 1000);
      return;
    }
    userReplies.push(properFormattedWord);
    this.setState({
      submittedWords: userReplies,
      userInput: "",
      availableLetters: this.state.letters
    });
  };

  startGame = () => {
    this.sendGameAction("newRound");
    this.setState({ userMessage: "" });
  };

  renderWordsAsDivs = words => {
    return words.map(word => {
      return <div key={word}>{word}</div>;
    });
  };

  render = () => {
    if (!this.state.gameStart) return <div>...Loading</div>;
    if (
      this.state.gameStart &&
      !this.state.gameRunning &&
      !this.state.gameEnded
    ) {
      return (
        <div className="wordGameContainer">
          <div className="userMessage">{this.state.userMessage}</div>
          <button onClick={this.startGame}>Begin!</button>
        </div>
      );
    }
    if (this.state.gameRunning) {
      return (
        <div className="wordGameContainer">
          <Timer />
          <div className="letters">{this.renderLetters()}</div>
          <h4>Words entered</h4>
          <div>{this.renderWordsAsDivs(this.state.submittedWords)}</div>
          <div>{this.state.userMessage}</div>
          <form className="wordGameForm" onSubmit={this.onSubmitHandler}>
            <input
              type="text"
              onChange={this.textInputOnChangeHandler}
              value={this.state.userInput}
            />
            <input type="submit" />
          </form>
        </div>
      );
    }
    if (this.state.gameEnded) {
      return (
        <div className="wordGameContainer">
          <h2>Game Over!</h2>
          <div>Your score: {this.state.ownScore}</div>
          <div>Your words {this.renderWordsAsDivs(this.state.ownWords)}</div>
          <div>
            {this.state.opponentName}'s score: {this.state.opponentScore}
          </div>
          <div>
            {this.state.opponentName}'s words{" "}
            {this.renderWordsAsDivs(this.state.opponentWords)}
          </div>
          <button onClick={this.startGame}>Play Again?</button>
        </div>
      );
    }
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let WordGame = connect(mapStateToProps)(UnconnectedWordGame);

export default WordGame;

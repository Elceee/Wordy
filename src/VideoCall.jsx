import React, { Component } from "react";
import { connect } from "react-redux";
import "./Conversation.css";

var pc;

var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var pcConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};

class UnconnectedVideoCall extends Component {
  constructor(props) {
    super(props);
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.state = {
      localStream: "",
      remoteStream: "",
      isChannelReady: false,
      isInitiator: false,
      isStarted: false,
      room: this.props.id,
      isGameStart: false
    };
  }
  componentDidMount = async () => {
    let response = await fetch("/getServers");
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    pcConfig.iceServers = body.iceServers;
    let socket = io();
    let room = this.props.id;
    socket.emit("create or join", room);
    socket.on("gameStart", () => {
      if (!this.state.isGameStart) {
        this.setState({ isGameStart: true });
      }
    });
    socket.on("created", room => {
      console.log("socket.on created");
      this.setState({ isInitiator: true });
    });

    socket.on("full", room => {});

    socket.on("join", room => {
      console.log("socket.on join");
      this.setState({ isChannelReady: true });
    });

    socket.on("joined", room => {
      console.log("joined: " + room);
      this.setState({ isChannelReady: true });
    });
    socket.on("message", message => {
      console.log("Client received message:", message);
      if (message === "got user media") {
        this.maybeStart();
      } else if (message.type === "offer") {
        if (!this.state.isInitiator && !this.state.isStarted) {
          this.maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        this.doAnswer();
      } else if (message.type === "answer" && this.state.isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === "candidate" && this.state.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
      } else if (message === "bye" && this.state.isStarted) {
        this.handleRemoteHangup();
      }
    });
    let gotLocalMediaStream = mediaStream => {
      this.localVideoRef.current.srcObject = mediaStream;
      this.setState({ localStream: mediaStream });
      this.sendMessage("got user media");
      if (this.state.isInitiator) {
        this.maybeStart();
      }
    };
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then(gotLocalMediaStream);
  };

  componentWillUnmount = () => {
    let socket = io();
    this.state.localStream.getTracks().forEach(track => track.stop());
    // socket.emit("bye", this.state.room);
  };
  doAnswer = () => {
    pc.createAnswer(
      this.setLocalAndSendMessage,
      this.onCreateSessionDescriptionError
    );
  };

  maybeStart = () => {
    if (
      !this.state.isStarted &&
      typeof this.state.localStream !== "undefined" &&
      this.state.isChannelReady
    ) {
      this.createPeerConnection();
      pc.addStream(this.state.localStream);
      this.setState({ isStarted: true });
      if (this.state.isInitiator) {
        this.doCall();
      }
    }
  };

  createPeerConnection = () => {
    try {
      pc = new RTCPeerConnection(pcConfig);
      pc.onicecandidate = this.handleIceCandidate;
      pc.onaddstream = this.handleRemoteStreamAdded;
      pc.onremovestream = this.handleRemoteStreamRemoved;
    } catch (e) {
      console.log("Connection error!", e.message);
      alert("Cannot create RTC connection");
      return;
    }
  };

  doCall = () => {
    pc.createOffer(this.setLocalAndSendMessage, this.handleCreatedOfferError);
  };

  onCreateSessionDescriptionError = error => {
    console.log("error creating Session Description", error.toString());
  };

  handleCreatedOfferError = event => {
    console.log("Error in creating offer", event);
  };

  setLocalAndSendMessage = sessionDescription => {
    pc.setLocalDescription(sessionDescription);
    this.sendMessage(sessionDescription);
  };

  handleRemoteStreamRemoved = () => {
    console.log("Remote stream removed");
  };

  handleRemoteStreamAdded = event => {
    let mediaStream = event.stream;
    this.remoteVideoRef.current.srcObject = mediaStream;
    this.setState({ remoteStream: mediaStream });
  };

  handleIceCandidate = event => {
    let candidate = event.candidate;
    if (candidate) {
      this.sendMessage({
        type: "candidate",
        label: candidate.sdpMLineIndex,
        id: candidate.sdpMid,
        candidate: candidate.candidate
      });
    } else {
      console.log("No more candidates");
    }
  };

  handleRemoteHangup = () => {
    window.stop();
    this.state.isInitiator = false;
  };

  sendMessage = message => {
    let socket = io();
    socket.emit("message", message, this.state.room);
  };

  startGame = event => {
    event.preventDefault();
    this.setState({ isGameStart: true });
  };

  render = () => {
    if (!this.state.isGameStart) {
      return (
        <div className="videoCallContainer">
          <div className="videoholder">
            <div className="videoContainer">
              <video
                className="localVideo"
                ref={this.localVideoRef}
                autoPlay
                playsInline
              />
            </div>

            <div className="videoContainer">
              <video
                className="remoteVideo"
                ref={this.remoteVideoRef}
                autoPlay
                playsInline
              />
            </div>
          </div>
          <script src="https://webrtc.github.io/adapter/adapter-latest.js" />
        </div>
      );
    }
  };
}

let mapStateToProps = state => {
  return { username: state.username };
};

let VideoCall = connect(mapStateToProps)(UnconnectedVideoCall);

export default VideoCall;

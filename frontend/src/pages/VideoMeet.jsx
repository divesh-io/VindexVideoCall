import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import server from "../environment.js";

  // const serverURL = "http://localhost:8000";
  const serverURL = server.prod; // Use the production server URL from environment.js 


export default function VideoMeet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Room name can come from the Home page or default to a demo room.
  const roomName = searchParams.get("room") || "demo-room";
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const pendingOfferRef = useRef({});

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Helper to create a new WebRTC peer connection for each remote user.
  const createPeerConnection = useCallback((remoteSocketId) => {
    if (peerConnectionsRef.current[remoteSocketId]) {
      return peerConnectionsRef.current[remoteSocketId];
    }

    const rtcConnection = new window.RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    rtcConnection.ontrack = (event) => {
      const incomingStream = event.streams[0];
      setRemoteStreams((prev) => {
        const exists = prev.some((item) => item.id === remoteSocketId);
        if (exists) {
          return prev.map((item) =>
            item.id === remoteSocketId ? { ...item, stream: incomingStream } : item
          );
        }
        return [...prev, { id: remoteSocketId, stream: incomingStream }];
      });
    };

    rtcConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("signal", remoteSocketId, {
          type: "candidate",
          candidate: event.candidate,
        });
      }
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        rtcConnection.addTrack(track, stream);
      });
    }

    peerConnectionsRef.current[remoteSocketId] = rtcConnection;
    return rtcConnection;
  }, []);

  // This method handles the actual WebRTC signaling handshake.
  const handleSignal = useCallback(
    async (remoteSocketId, message) => {
      let peerConnection = peerConnectionsRef.current[remoteSocketId];

      if (!peerConnection) {
        peerConnection = createPeerConnection(remoteSocketId);
      }

      try {
        if (message.type === "offer") {
          if (peerConnection.signalingState !== "stable") {
            return;
          }

          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socketRef.current.emit("signal", remoteSocketId, {
            type: "answer",
            answer,
          });
        }

        if (message.type === "answer") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
        }

        if (message.type === "candidate") {
          if (message.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
        }
      } catch (error) {
        console.error("Signal handling failed:", error);
      }
    },
    [createPeerConnection]
  );

  // Start the local camera and microphone before joining the room.
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Camera or microphone access failed:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!roomName) {
      return;
    }

    // Join room automatically once page loads.
    const joinRoom = async () => {
      const stream = await startMedia();
      if (!stream) {
        return;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io(serverURL, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("join-call", roomName);
        setIsJoined(true);
      });

      // Server tells us when someone enters the same meeting room.
      socketRef.current.on("user-joined", async (socketId, members) => {
        console.log("New participant joined:", socketId, members);
        if (socketId !== socketRef.current.id) {
          const peerConnection = createPeerConnection(socketId);

          if (pendingOfferRef.current[socketId]) {
            return;
          }

          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          pendingOfferRef.current[socketId] = true;
          socketRef.current.emit("signal", socketId, { type: "offer", offer });
        }
      });

      // We receive signaling messages from peers here.
      socketRef.current.on("signal", (fromSocketId, message) => {
        if (message.type === "answer" || message.type === "candidate") {
          pendingOfferRef.current[fromSocketId] = false;
        }
        handleSignal(fromSocketId, message);
      });

      socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${socketIdSender}-${Date.now()}`,
            sender,
            text: data,
          },
        ]);
      });

      socketRef.current.on("user-left", (socketId) => {
        const peerConnection = peerConnectionsRef.current[socketId];
        if (peerConnection) {
          peerConnection.close();
          delete peerConnectionsRef.current[socketId];
        }

        setRemoteStreams((prev) => prev.filter((item) => item.id !== socketId));
      });
    };

    joinRoom();

    return () => {
      const currentConnections = peerConnectionsRef.current;

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      Object.values(currentConnections).forEach((peerConnection) => {
        peerConnection.close();
      });
    };
  }, [roomName, createPeerConnection, handleSignal]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) {
      return;
    }

    socketRef.current.emit("chat-message", newMessage, "You");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: "You",
        text: newMessage,
      },
    ]);
    setNewMessage("");
  };

  const toggleMic = () => {
    if (!localStream) {
      return;
    }

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicEnabled((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!localStream) {
      return;
    }

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraEnabled((prev) => !prev);
  };

  const leaveMeeting = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    navigate("/home");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
      color: "#f8fafc",
      padding: 24,
      fontFamily: "Inter, Arial, sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#93c5fd", textTransform: "uppercase", fontWeight: 700 }}>
              Live Meeting
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: "2rem" }}>Room: {roomName}</h2>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={toggleMic} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #475569", background: micEnabled ? "#1d4ed8" : "#374151", color: "#fff", cursor: "pointer" }}>
              {micEnabled ? "Mute" : "Unmute"}
            </button>
            <button onClick={toggleCamera} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #475569", background: cameraEnabled ? "#10b981" : "#374151", color: "#fff", cursor: "pointer" }}>
              {cameraEnabled ? "Stop Video" : "Start Video"}
            </button>
            <button onClick={leaveMeeting} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #ef4444", background: "#ef4444", color: "#fff", cursor: "pointer" }}>
              Leave
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div style={{ background: "rgba(17, 24, 39, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 20, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>You</h3>
              <span style={{ fontSize: 12, color: isJoined ? "#86efac" : "#fbbf24" }}>{isJoined ? "Connected" : "Connecting..."}</span>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", borderRadius: 14, background: "#000", minHeight: 240, objectFit: "cover" }}
            />
          </div>

          {remoteStreams.length === 0 ? (
            <div style={{ background: "rgba(17, 24, 39, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 20, padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
              <div style={{ textAlign: "center", color: "#cbd5e1" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>◉</div>
                <div>Waiting for another participant to join</div>
              </div>
            </div>
          ) : (
            remoteStreams.map((remote) => (
              <div key={remote.id} style={{ background: "rgba(17, 24, 39, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 20, padding: 12 }}>
                <h3 style={{ marginBottom: 8 }}>Remote {remote.id.slice(0, 6)}</h3>
                <video
                  autoPlay
                  playsInline
                  ref={(element) => {
                    if (element) {
                      element.srcObject = remote.stream;
                    }
                  }}
                  style={{ width: "100%", borderRadius: 14, background: "#000", minHeight: 240, objectFit: "cover" }}
                />
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ background: "rgba(17, 24, 39, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 20, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Meeting Chat</h3>
            <div style={{ minHeight: 180, maxHeight: 220, overflowY: "auto", marginBottom: 12, background: "rgba(15, 23, 42, 0.8)", borderRadius: 12, padding: 12 }}>
              {messages.length === 0 ? (
                <p style={{ color: "#94a3b8", margin: 0 }}>No messages yet. Start the conversation.</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} style={{ marginBottom: 8, color: "#e2e8f0" }}>
                    <strong>{message.sender}:</strong> {message.text}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Type your message"
                style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
              />
              <button onClick={sendMessage} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>

          <div style={{ background: "rgba(17, 24, 39, 0.85)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 20, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Meeting Info</h3>
            <p style={{ color: "#cbd5e1" }}>Status: {isJoined ? "Connected" : "Connecting..."}</p>
            <p style={{ color: "#cbd5e1" }}>Room ID: {roomName}</p>
            <p style={{ color: "#cbd5e1" }}>Tip: open the same room in another tab or browser to test the call.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

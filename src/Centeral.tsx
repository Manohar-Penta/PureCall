import { useCallback, useEffect, useRef, useState } from "react";
import VideoCall from "./VideoCall";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { ImPhoneHangUp } from "react-icons/im";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:5349" },
  { urls: "stun:stun1.l.google.com:3478" },
];

interface messageType {
  type: string;
  id?: string;
  target?: string;
  sender?: string;
  sdp?: RTCSessionDescriptionInit;
  ice_candidate?: RTCIceCandidateInit;
}

export default function Centeral() {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>("");
  const [LS, setLS] = useState<MediaStream | null>(null);
  const [RS, setRS] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // console.log("render", target);

  const closeVideoCall = useCallback(() => {
    console.log("Closing the call");

    if (pcRef.current) {
      pcRef.current.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });
      // Close the peer connection
      pcRef.current.close();
      pcRef.current = null;
    } else {
      // console.log("no pcref.current", pcRef.current);
    }

    setTarget("");

    setLS((LS) => {
      LS?.getTracks().forEach((track) => {
        track.stop();
      });
      return null;
    });

    setRS((RS) => {
      RS?.getTracks().forEach((track) => {
        track.stop();
      });
      return null;
    });
  }, [setRS, setLS]);

  const handleTrack = useCallback(
    (event: RTCTrackEvent) => {
      // console.log("received tracks");
      const incomingStream = new MediaStream();

      event.streams[0].getTracks().forEach((track) => {
        incomingStream.addTrack(track);
      });

      setRS(incomingStream);
    },
    [setRS]
  );

  const handlenegotiation = useCallback(() => {
    if (pcRef.current == null) {
      console.log("no connection detected!!");
      return;
    }
    if (pcRef.current.signalingState != "stable") {
      console.log("The connection isn't stable yet; postponing...");
      return;
    }
    pcRef.current
      ?.createOffer()
      .then(async (offer) => {
        await pcRef.current?.setLocalDescription(offer);
        socket?.send(
          JSON.stringify({
            type: "offer_forward",
            sender: id,
            target,
            sdp: pcRef.current?.localDescription,
          })
        );
      })
      .catch((e) => {
        console.log(e);
      });
  }, [id, target, socket]);

  const handleIcecandidate = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      // console.log("retrieved Ice");
      if (target == "") {
        console.log("no target");
        return;
      }
      if (event.candidate) {
        socket?.send(
          JSON.stringify({
            type: "ice_candidate",
            sender: id,
            target,
            ice_candidate: event.candidate,
          })
        );
      }
    },
    [id, target, socket]
  );

  const handleSignalingStateChangeEvent = useCallback(() => {
    console.log(
      "*** WebRTC signaling state changed to: " + pcRef.current?.signalingState
    );
    switch (pcRef.current?.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  }, [closeVideoCall]);

  const handleICEConnectionStateChangeEvent = useCallback(() => {
    console.log(
      "*** ICE connection state changed to " + pcRef.current?.iceConnectionState
    );

    switch (pcRef.current?.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        closeVideoCall();
        break;
    }
  }, [closeVideoCall]);

  const handleOffer = useCallback(
    async (msg: messageType) => {
      try {
        if (pcRef.current) {
          console.log("connection exists and offer rejected");
          return;
        }
        if (!socket) {
          console.log("socket not present", socket);
          throw "socket not present";
        }

        pcRef.current = new RTCPeerConnection({ iceServers });

        await navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then((stream) => {
            stream.getTracks().forEach((track) => {
              pcRef.current?.addTrack(track, stream);
            });
            setLS(stream);
          })
          .catch((e) => {
            console.log(e);
            pcRef.current = null;
            // console.log("returning before handling offer");
            return;
          });

        // console.log(msg.sender);
        setTarget(() => {
          // console.log("setting target in the offer accepter!!");
          return msg.sender as string;
        });

        pcRef.current.onnegotiationneeded = handlenegotiation;
        pcRef.current.onsignalingstatechange = handleSignalingStateChangeEvent;
        pcRef.current.oniceconnectionstatechange =
          handleICEConnectionStateChangeEvent;
        pcRef.current.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          // console.log("retrieved Ice");
          if (event.candidate) {
            socket?.send(
              JSON.stringify({
                type: "ice_candidate",
                sender: id,
                target: msg.sender,
                ice_candidate: event.candidate,
              })
            );
          }
        };
        pcRef.current.ontrack = (event: RTCTrackEvent) => {
          // console.log("received tracks");
          const incomingStream = new MediaStream();

          event.streams[0].getTracks().forEach((track) => {
            incomingStream.addTrack(track);
          });

          setRS(incomingStream);
        };

        await pcRef.current?.setRemoteDescription(
          msg.sdp as RTCSessionDescriptionInit
        );

        await pcRef.current.createAnswer().then(async (answer) => {
          // console.log("forwarding the answer");
          await pcRef.current?.setLocalDescription(answer);
          socket?.send(
            JSON.stringify({
              type: "answer_forward",
              sender: id,
              target: msg.sender,
              sdp: pcRef.current?.localDescription,
            })
          );
          // console.log("answer sent");
        });
      } catch (e) {
        console.log(e);
      }
    },
    [
      id,
      socket,
      handlenegotiation,
      handleICEConnectionStateChangeEvent,
      handleSignalingStateChangeEvent,
    ]
  );

  const Message = useCallback(
    async (msg: string) => {
      const message: messageType = JSON.parse(msg);
      // if (message.type == "answer_forward") console.log(message);
      switch (message.type) {
        case "join":
          setId(message.id as string);
          break;
        case "offer_forward":
          handleOffer(message);
          break;
        case "answer_forward":
          // console.log("answer received!!");
          pcRef.current?.setRemoteDescription(
            message.sdp as RTCSessionDescriptionInit
          );
          break;
        case "ice_candidate":
          pcRef.current
            ?.addIceCandidate(new RTCIceCandidate(message.ice_candidate))
            .then(() => {
              // console.log("ice set");
            });
          break;
        case "quit":
          closeVideoCall();
          break;
        default:
          break;
      }
    },
    [handleOffer, closeVideoCall]
  );

  const hangUp = useCallback(async () => {
    socket?.send(JSON.stringify({ type: "quit", sender: id, target }));
    closeVideoCall();
  }, [id, socket, target, closeVideoCall]);

  const invite = useCallback(async () => {
    closeVideoCall();
    // console.log("invite target : ", target);
    setTarget(target);
    pcRef.current = new RTCPeerConnection({ iceServers });

    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          aspectRatio: {
            ideal: 1.333333, // 3:2 aspect ratio
          },
        },
      })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });
        setLS(stream);
      })
      .catch((e) => {
        console.log(e);
        return;
      });

    pcRef.current.onnegotiationneeded = handlenegotiation;
    pcRef.current.onsignalingstatechange = handleSignalingStateChangeEvent;
    pcRef.current.oniceconnectionstatechange =
      handleICEConnectionStateChangeEvent;
    pcRef.current.onicecandidate = handleIcecandidate;
    pcRef.current.ontrack = handleTrack;
  }, [
    handlenegotiation,
    handleIcecandidate,
    handleTrack,
    closeVideoCall,
    handleICEConnectionStateChangeEvent,
    handleSignalingStateChangeEvent,
    target,
  ]);

  function toggleAudio() {
    const audioTrack = LS?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack?.enabled;
    setIsAudioEnabled(audioTrack.enabled);
  }

  function toggleVideo() {
    const videoTrack = LS?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoEnabled(videoTrack.enabled);
  }

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("socket opening!!");
    };

    socket.onclose = () => {
      console.log("socket closeing");
    };

    socket.onerror = (e) => {
      console.log(e);
    };

    setSocket(socket);

    return () => {
      // console.log("socket is being removed");
      if (socket.OPEN) socket.close();
    };
  }, []);

  useEffect(() => {
    if (socket == null) return;
    socket.onmessage = (event: MessageEvent) => {
      Message(event.data);
    };
  }, [Message, socket]);

  return (
    <div className="bg-slate-800 text-white min-h-screen p-2 flex flex-col justify-start">
      {id && pcRef.current == null ? (
        <h1 className="text-white text-2xl p-8 mb-2 mx-0 text-center">
          Your ID : {id}
        </h1>
      ) : pcRef.current == null ? (
        <div className="text-center text-xl font-semibold p-4">
          Connecting the Server...
        </div>
      ) : (
        <></>
      )}
      <div className="">
        <div className="flex justify-center items-center">
          <Input
            type="text"
            id="target"
            value={target as string}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Enter target ID"
            required
            autoComplete="off"
            className="text-gray-700"
          />
          <Button
            className="m-2 border border-white px-8"
            type="button"
            onClick={invite}
          >
            Call
          </Button>
        </div>
      </div>
      <VideoCall LS={LS} RS={RS} />
      {pcRef.current && (
        <div className="flex justify-center my-auto">
          <div className="flex justify-center gap-6 border border-white p-2 rounded">
            <button type="button" onClick={toggleAudio}>
              {isAudioEnabled ? (
                <FaMicrophone
                  size={"2rem"}
                  color="green"
                  className="border rounded-full border-white p-1 bg-white"
                />
              ) : (
                <FaMicrophoneSlash size={"2rem"} />
              )}
            </button>
            <button type="button" onClick={toggleVideo}>
              {isVideoEnabled ? (
                <FaVideo
                  size={"2rem"}
                  color="dodgerblue"
                  className="border rounded-full border-white p-1 bg-white"
                />
              ) : (
                <FaVideoSlash size={"2rem"} />
              )}
            </button>
            <button
              onClick={hangUp}
              disabled={pcRef.current == null}
              className="text-red-500"
            >
              <ImPhoneHangUp size={"2rem"} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react"

const Sender = () => {
  const [pc, set_pc] = useState<RTCPeerConnection | null>();
  const [socket, set_socket] = useState<WebSocket | null>();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection()
    set_pc(pc);

    const socket = new WebSocket("ws://localhost:8080");
    set_socket(socket);

    socket.send(JSON.stringify({ type: "identify-as-sender" }));

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "create-answer") {
        pc.setRemoteDescription(message.answer);
      } else if (message.type == "ice-candidate") {
        pc?.addIceCandidate(message.candidate)
      }
    }

  }, [])

  async function place_a_call() {
    pc!.onnegotiationneeded = async (e) => {
      const offer = await pc?.createOffer();

      pc?.setLocalDescription(offer);

      socket?.send(JSON.stringify({ type: "offer", sdp: offer }));
    }


    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      pc?.addTrack(stream.getVideoTracks()[0]);
    })

    pc!.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(JSON.stringify({ type: "exchange-ice-candidate", candidate: event.candidate }))
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white">
      <p>Sender</p>
      <button className="bg-slate-200 p-2 text-black font-bold text-lg rounded-md" onClick={place_a_call}>Place a call</button>
      <video ref={videoRef} className="h-80 w-80" />
    </div>
  )
}

export default Sender
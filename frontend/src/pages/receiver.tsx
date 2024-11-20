import { useEffect, useRef, useState } from "react"

const Receiver = () => {
  const [pc,] = useState<RTCPeerConnection>(new RTCPeerConnection);
  const [socket,] = useState<WebSocket>(new WebSocket("ws://localhost:8080"));

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {

    socket?.send(JSON.stringify({ type: "identify-as-receiver" }));

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "create-offer") {
        pc.setRemoteDescription(message.offer);

        const answer = await pc.createAnswer();

        pc.setRemoteDescription(answer);

        socket.send(JSON.stringify({ type: "answer", sdp: answer }))

        pc.ontrack = (event: RTCTrackEvent) => {
          if (videoRef.current) {
              videoRef.current.srcObject = event.streams[0]; // Use the first MediaStream.
              videoRef.current.play();
          }
      };

      } else if (message.type == "ice-candidate") {
        pc?.addIceCandidate(message.candidate)
      }

    }

    pc.onicecandidate = (event) => {
      socket.send(JSON.stringify({ type: "exchange-ice-candidate", candidate: event.candidate }))
    }
  }, [])



  return (
    <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
      <p>Receiver</p>
      <video ref={videoRef} className="h-80 w-80" />
    </div>
  )
}

export default Receiver
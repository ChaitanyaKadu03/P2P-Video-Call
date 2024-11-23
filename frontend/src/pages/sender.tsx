import { useEffect, useRef, useState } from "react";

const Sender = () => {
    const [socket, set_socket] = useState<WebSocket | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {

        const socket = new WebSocket("ws://localhost:8080");

        set_socket(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "identify-as-sender" }));
        }

    }, []);

    async function send_video() {
        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();

            await pc.setLocalDescription(offer);

            socket?.send(JSON.stringify({ type: "offer", sdp: offer }));
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        pc.addTrack(stream.getVideoTracks()[0]);

        getCameraStreamAndSend(pc)

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({ type: "exchange-ice-candidate", ice_candidate: event.candidate }));
            }
        }

        socket!.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type == 'answer') {
                await pc.setRemoteDescription(message.sdp);
                console.log(pc);
            } else if (message.type === "exchange-ice-candidate") {
                await pc?.addIceCandidate(message.ice_candidate)
            }
        }
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }

    return (
        <div className="flex items-center justify-center h-screen bg-slate-800 text-white">
            <div>
                <p>Sender</p>
                <button onClick={send_video}>Send Video</button>
            </div>
            <video ref={videoRef} className="h-80 w-80" />
        </div>
    )
}

export default Sender
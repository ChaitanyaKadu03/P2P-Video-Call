import { useEffect, useState } from "react"

const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {

        const socket = new WebSocket('ws://localhost:8080');

        setSocket(socket)

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "identify-as-sender" }))
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data)

            if (message.type === "answer") {
                pc?.setRemoteDescription(message.answer)
            } else if (message.type == "iceCandidate") {
                pc?.addIceCandidate(message.candidate)
            }
        }

    }, [])

    async function startSendingVideo() {
        const pc = new RTCPeerConnection();

        setPc(pc);

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();

            await pc.setLocalDescription(offer);

            socket?.send(JSON.stringify({ type: "create-offer", offer: pc.localDescription }));
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }))
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

        pc.addTrack(stream.getVideoTracks()[0]);

        getCameraStreamAndSend(pc);
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
        <div className="flex flex-row justify-center items-center gap-4">
            <div>Sender</div>
            <button onClick={startSendingVideo} className="bg-slate-400">Send Video</button>
        </div>
    )
}

export default Sender
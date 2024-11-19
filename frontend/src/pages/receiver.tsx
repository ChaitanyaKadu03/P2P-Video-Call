import { useEffect, useState } from "react"

const Receiver = () => {
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {

        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "identify-as-receiver" }))
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log(message);

            if (message.type === "offer") {
                console.log(message);

                const pc = new RTCPeerConnection();

                setPc(pc)

                pc.setRemoteDescription(message.offer);

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket?.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }))
                    }
                }

                const video = document.createElement('video');
                document.body.appendChild(video);
        
                pc.ontrack = (event) => {
                    video.srcObject = new MediaStream([event.track]);
                    video.play();
                }

                const answer = await pc.createAnswer();

                await pc.setLocalDescription(answer)

                socket.send(JSON.stringify({ type: "create-answer", answer: pc.localDescription }))
            } else if (message.type === "iceCandidate") {
                pc?.addIceCandidate(message.candidate)
            }
        }

    }, [])

    return (
        <div className="flex flex-row justify-center items-center gap-4">
            <div>Receiver</div>
        </div>
    )
}

export default Receiver
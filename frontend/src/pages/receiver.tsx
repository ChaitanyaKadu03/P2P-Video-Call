import { useEffect, useState } from "react";

const Receiver = () => {
    const [, set_receiver] = useState<WebSocket | null>(null);

    useEffect(() => {

        const socket = new WebSocket("ws://localhost:8080");

        set_receiver(socket);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "identify-as-receiver" }));
        }
        
        const pc = new RTCPeerConnection();

        socket.onmessage = async (event) => {
            console.log(event.data);

            const message = JSON.parse(event.data);


            if (message.type == "offer") {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === "exchange-ice-candidate") {
                await pc?.addIceCandidate(message.ice_candidate)
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket?.send(JSON.stringify({ type: "exchange-ice-candidate", ice_candidate: event.candidate }));
                }
            }

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            socket.send(JSON.stringify({ type: "answer", sdp: answer }));
        }

    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-slate-800 text-white">
            <div>
                <p>Receiver</p>
            </div>
            {/* <Video/> */}
        </div>
    )
}

export default Receiver
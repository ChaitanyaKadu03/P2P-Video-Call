import { WebSocket, WebSocketServer } from "ws";

const wss: WebSocketServer = new WebSocketServer({ port: 8080 });

let senderServer: WebSocket | null = null;
let receiverServer: WebSocket | null = null;

wss.on("connection", (ws) => {
	ws.on("error", console.error);

	ws.on("message", async (data) => {

		const message = JSON.parse(data.toString('utf8'));

		console.log(message);
		

		switch (message.type) {
			case "identify-as-sender":
				console.log("identify-as-sender");

				senderServer = ws;
				break;
			case "identify-as-receiver":
				console.log("identify-as-receiver");

				receiverServer = ws;
				break;
			case "send-offer":
				console.log("send-offer");

				receiverServer?.send(JSON.stringify({ type: "offer", sdp: message.offer }));
				break;
			case "send-answer":
				console.log("send-answer");

				receiverServer?.send(JSON.stringify({ type: "answer", sdp: message.answer }));
				break;
			case "exchange-ice-candidate":
				console.log("exchange-ice-candidate");

				if (senderServer == ws) {
					receiverServer?.send(JSON.stringify({ type: "ice-candidate", iceCandidate: message.iceCandidate }));
				} else if (receiverServer == ws) {
					senderServer?.send(JSON.stringify({ type: "ice-candidate", iceCandidate: message.iceCandidate }));
				}
				break;
			default:
				ws.send(`Type ${message.type} is invalid`)
		}

	})

	console.log("Connected!");
})
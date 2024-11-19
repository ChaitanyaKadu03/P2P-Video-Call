import { WebSocket } from "ws";

const { WebSocketServer } = require("ws")

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", function connection(ws: WebSocket) {
	ws.on('error', console.error);

	ws.on('message', function message(data: any) {
		const message = JSON.parse(data)

		if (message.type === "identify-as-sender") {
			console.log("sender set");

			senderSocket = ws;
		} else if (message.type === "identify-as-receiver") {
			console.log("receiver set");

			receiverSocket = ws;
		} else if (message.type === "create-offer") {
			console.log("create-offer");

			receiverSocket?.send(JSON.stringify({ type: "offer", offer: message.offer }));
		} else if (message.type === "create-answer") {
			console.log("create-answer");

			senderSocket?.send(JSON.stringify({ type: "answer", answer: message.answer }));
		} else if (message.type == "iceCandidate") {
			if (ws === senderSocket) {
				receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
			} else if (ws === receiverSocket) {
				senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
			}
		}

		ws.send(data.toString('utf-8'))
	})
})

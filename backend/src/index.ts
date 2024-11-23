import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderServer: WebSocket | null;
let receiverServer: WebSocket | null;

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', async (data) => {

        const message = JSON.parse(data.toString('utf-8'));

        switch (message.type) {
            case 'identify-as-sender':
                if (!(senderServer!)) {
                    console.log(`Identified as sender!`);
                    senderServer = ws;
                } else {
                    console.error("Sender already exists!")
                }
                break;
            case 'identify-as-receiver':
                if (!(receiverServer!)) {
                    console.log(`Identified as receiver!`);
                    receiverServer = ws;
                } else {
                    console.error("Receiver already exists!")
                }
                break;
            case 'offer':
                if (ws == senderServer) {
                    console.log(`Sender is sending a offer!`);
                    receiverServer?.send(JSON.stringify(message));
                } else {
                    console.error("Offer can be send by senders server only")
                }
                break;
            case 'answer':
                if (ws == receiverServer) {
                    console.log(`Receiver is sending a answer!`);
                    senderServer?.send(JSON.stringify(message));
                } else {
                    console.error("Offer can be send by receivers server only")
                }
                break;
            case 'exchange-ice-candidate':
                if (ws == senderServer) {
                    console.log(`Sender is sending a ice candidates!`);
                    receiverServer?.send(JSON.stringify(message));
                } else if (ws == receiverServer) {
                    console.log(`Receiver is sending a ice candidates!`);
                    senderServer?.send(JSON.stringify(message));
                }
                break;
            default:
                console.error("Message type ", message.type, " is invalid!");
                break;
        }
    })

    ws.send("New server connected");
})
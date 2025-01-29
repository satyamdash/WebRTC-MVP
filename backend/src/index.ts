import { WebSocketServer,WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if(message.type === 'identify-as-sender') {
      senderSocket = ws;
    }
    else if(message.type === 'identify-as-receiver') {
      receiverSocket = ws;
    }
    else if(message.type === 'create-offer') {
        if(ws!==senderSocket){
            ws.send('You are not the sender');
            return;
        }
      if(receiverSocket) {
        receiverSocket.send(JSON.stringify({ type: 'createoffer', sdp: message.sdp }));
      }
    }
    else if(message.type === 'create-answer') {
        if(ws!=receiverSocket){
            ws.send('You are not the receiver');
            return;
        }
      if(senderSocket) {
        senderSocket.send(JSON.stringify({ type: 'createanswer', sdp: message.sdp }));
      }
    }
    else if(message.type === 'ice-candidate') {
      if(ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'icecandidate', candidate: message.candidate }));
      }
      else if(receiverSocket && ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'icecandidate', candidate: message.candidate }));
      }
    }
    
    });

  ws.send('something');
}); 
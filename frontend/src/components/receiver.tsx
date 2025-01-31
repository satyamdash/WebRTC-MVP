import { useEffect, useState } from "react"


export const Receiver = () => {
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8081');
        socket.onopen = () => {
            console.log('receiver connected');
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
        
    }, []);

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        video.autoplay = true;
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            video.srcObject = event.streams[0];
            document.body.appendChild(video);
        }

        socket.onmessage = (event) => {

            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                console.log('createOffer');
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                console.log('receiver iceCandidate');
                pc.addIceCandidate(message.candidate);
            }
        }
    }

    return <div>
        
    </div>
}
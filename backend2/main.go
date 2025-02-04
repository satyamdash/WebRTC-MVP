package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Message struct {
	Type      string          `json:"type"`
	SDP       json.RawMessage `json:"sdp,omitempty"`
	Candidate json.RawMessage `json:"candidate,omitempty"`
}

type Server struct {
	mu       sync.Mutex
	sender   *websocket.Conn
	receiver *websocket.Conn
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		var msg Message
		//log.Println("Received:", string(data))
		//log.Println("Unmarshalling")
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Println("JSON error:", err)
			continue
		}

		s.mu.Lock()
		switch msg.Type {
		case "sender":
			s.sender = conn
			s.mu.Unlock()
			log.Println("Sender connected")
			continue
		case "receiver":
			s.receiver = conn
			s.mu.Unlock()
			log.Println("Receiver connected")
			continue
		case "createOffer":
			if conn != s.sender {
				s.mu.Unlock()
				continue
			}
			log.Println("createOffer")
			receiver := s.receiver
			s.mu.Unlock()
			if receiver != nil {
				receiver.WriteJSON(Message{Type: "createOffer", SDP: msg.SDP})
			}
			continue
		case "createAnswer":
			if conn != s.receiver {
				s.mu.Unlock()
				continue
			}
			log.Println("createAnswer")
			sender := s.sender
			s.mu.Unlock()
			if sender != nil {
				sender.WriteJSON(Message{Type: "createAnswer", SDP: msg.SDP})
			}
			continue
		case "iceCandidate":
			var target *websocket.Conn
			if conn == s.sender {
				log.Println("sender iceCandidate")
				target = s.receiver
			} else if conn == s.receiver {
				log.Println("receiver iceCandidate")
				target = s.sender
			} else {
				s.mu.Unlock()
				continue
			}
			s.mu.Unlock()
			if target != nil {
				target.WriteJSON(Message{Type: "iceCandidate", Candidate: msg.Candidate})
			}
			continue
		default:
			s.mu.Unlock()
			log.Println("Unknown message type:", msg.Type)
			continue
		}
	}

	// Clean up disconnected connections
	s.mu.Lock()
	defer s.mu.Unlock()
	if conn == s.sender {
		s.sender = nil
		log.Println("Sender disconnected")
	}
	if conn == s.receiver {
		s.receiver = nil
		log.Println("Receiver disconnected")
	}
}

func main() {
	server := &Server{}
	http.HandleFunc("/", server.handleWebSocket)
	log.Println("Starting server on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

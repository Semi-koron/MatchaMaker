package millstone

// ルーム接続の処理

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// WebSocket のアップグレーダー
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		allowUrl := os.Getenv("ALLOW_URL")
		if allowUrl == "" {
			allowUrl = "http://localhost:3000"
		}
		// リクエスト元の URL が許可リストに含まれているか確認
		if r.Header.Get("Origin") != allowUrl {
			log.Println("Origin not allowed:", r.Header.Get("Origin"))
			return false
		}
		return true
	},
}

// ルーム管理用のマップ
var rooms = make(map[string]map[*websocket.Conn]bool)

// クライアントの WebSocket 接続を処理
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("test")
	vars := mux.Vars(r)
	roomID := vars["roomID"]

	// WebSocket にアップグレード
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	// ルームがなければ作成
	if rooms[roomID] == nil {
		rooms[roomID] = make(map[*websocket.Conn]bool)
	}
	rooms[roomID][conn] = true
	log.Printf("Client connected to room: %s", roomID)

	// クライアントのメッセージを受け取るループ
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read Error:", err)
			delete(rooms[roomID], conn)
			break
		}

		// ルーム内の全クライアントにメッセージを送信
		for client := range rooms[roomID] {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Println("Write Error:", err)
				client.Close()
				delete(rooms[roomID], client)
			}
		}
	}
}


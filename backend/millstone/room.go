package millstone

// ルーム接続の処理

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// WebSocket のアップグレーダー
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		allowUrl := os.Getenv("ALLOW_URL")
		log.Println("ALLOW_URL:", allowUrl)
		if allowUrl == "" {
			allowUrl = "http://localhost:3000"
		}
		// リクエスト元の URL が許可リストに含まれているか確認
		origin := r.Header.Get("Origin")
		log.Println("Origin:", origin)
		if origin != allowUrl {
			log.Println("Origin not allowed:", r.Header.Get("Origin"))
			return false
		}
		return true
	},
}

// ルーム管理用のマップ
var rooms = make(map[string]map[*websocket.Conn]bool)

func sendMessage(roomID string, msg []byte) {
	for client := range rooms[roomID] {
		err := client.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Write Error:", err)
			client.Close()
			delete(rooms[roomID], client)
		}
	}
}

func timeup(roomID string) {
	// 30秒後にtimeupを送信
	fmt.Println("test")
	time.AfterFunc(30*time.Second, func() {
		sendMessage(roomID, []byte("finish"))
	})
}

// クライアントの WebSocket 接続を処理
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
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
	if len(rooms[roomID]) >= 2 {
		log.Println("Room is full")
		return
	}
	rooms[roomID][conn] = true
	log.Printf("Client connected to room: %s", roomID)
	// 2人目が入室したら"controller connected"を送信
	if len(rooms[roomID]) == 2 {
		for client := range rooms[roomID] {
			err := client.WriteMessage(websocket.TextMessage, []byte("controller connected"))
			if err != nil {
				log.Println("Write Error:", err)
				client.Close()
				delete(rooms[roomID], client)
			}
		}
		// 3...2...1...のカウントダウン
		time.AfterFunc(time.Second, func() {
			sendMessage(roomID, []byte("count3"))
			time.AfterFunc(time.Second, func() {
				sendMessage(roomID, []byte("count2"))
				time.AfterFunc(time.Second, func() {
					sendMessage(roomID, []byte("count1"))
					time.AfterFunc(time.Second, func() {
						sendMessage(roomID, []byte("start"))
						timeup(roomID)
					})
				})
			})
		})
	}

	// クライアントのメッセージを受け取るループ
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read Error:", err)
			delete(rooms[roomID], conn)
			break
		}

		// ルーム内の全クライアントにメッセージを送信
		sendMessage(roomID, msg)
	}
}



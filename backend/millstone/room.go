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
var currentGame = make(map[string]string)
var score = make(map[string]int)

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

func nextGame(roomID string, game string) {
	sendMessage(roomID, []byte(game))
	if (game == "resultPage") {return;}
	timeup(roomID)
}

func timeup(roomID string) {
	// 30秒後にtimeupを送信
	time.AfterFunc(30*time.Second, func() {
		sendMessage(roomID, []byte("finish"))
		time.AfterFunc(5*time.Second, func() {
			switch currentGame[roomID] {
			case "pluckTeaGame":
				nextGame(roomID, "fermentationGame")
				currentGame[roomID] = "fermentationGame"
			case "millstoneGame":
				nextGame(roomID, "resultPage")
				currentGame[roomID] = "result"
			}
		})
	})
}

func setupGame (roomID string) {
	sendMessage(roomID, []byte("controller connected"))
	// 3...2...1...のカウントダウン
	time.AfterFunc(time.Second, func() {
		sendMessage(roomID, []byte("count3"))
		time.AfterFunc(time.Second, func() {
			sendMessage(roomID, []byte("count2"))
			time.AfterFunc(time.Second, func() {
				sendMessage(roomID, []byte("count1"))
				time.AfterFunc(time.Second, func() {
					sendMessage(roomID, []byte("start"))
					if(currentGame[roomID] == "fermentationGame") {
						return;
					}
					timeup(roomID)
				})
			})
		})
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
		currentGame[roomID] = "pluckTeaGame"
		score[roomID] = 0
	}
	if len(rooms[roomID]) >= 2 {
		log.Println("Room is full")
		return
	}
	rooms[roomID][conn] = true
	log.Printf("Client connected to room: %s", roomID)
	// 2人目が入室したら"controller connected"を送信
	if len(rooms[roomID]) == 2 {
		setupGame(roomID)
	}

	// クライアントのメッセージを受け取るループ
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read Error:", err)
			delete(rooms[roomID], conn)
			break
		}
		if string(msg[:5]) == "score" {
			if len(msg) >= 8 {
				scoreValue := (int(msg[5]-'0')*100 + int(msg[6]-'0')*10 + int(msg[7]-'0'))
				score[roomID] += scoreValue
				log.Println("score:", score[roomID])
			}
			fmt.Println("score:", score[roomID])
			if(currentGame[roomID] == "fermentationGame") {
				nextGame(roomID, "millstoneGame")
				currentGame[roomID] = "millstoneGame"
			}
		}
		if string(msg) == "nextGame" {
			setupGame(roomID)
		}
		if string(msg) == "result" {
			sendMessage(roomID, []byte("total score" + fmt.Sprint(score[roomID])))
			score[roomID] = 0
		}
		// ルーム内の全クライアントにメッセージを送信
		sendMessage(roomID, msg)
	}
}



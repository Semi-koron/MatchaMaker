package mult

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)
var writeMutex sync.Mutex

// WebSocket のアップグレーダー
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		allowUrl := os.Getenv("ALLOW_URL")
		if allowUrl == "" {
			allowUrl = "http://localhost:3000"
		}
		origin := r.Header.Get("Origin")
		return origin == allowUrl
	},
}

// ルーム管理用のマップ
var rooms = make(map[string]map[*websocket.Conn]bool)
var roomHost = make(map[string]*websocket.Conn) // 各部屋のホストを管理
var score = make(map[string]map[*websocket.Conn]int)
var user = make(map[string]map[*websocket.Conn]string)
var currentGame = make(map[string]string)

// ホストのみにメッセージを送信
func sendMessageHost(roomID string, msg []byte) {
    host, exists := roomHost[roomID]
    if exists {
        writeMutex.Lock()  // ロック
        defer writeMutex.Unlock()  // 解放
        err := host.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            log.Println("Write Error to Host:", err)
            host.Close()
            delete(roomHost, roomID)
        }
    }
}

// ルーム内の全員にメッセージを送信
func sendMessageAll(roomID string, msg []byte) {
    writeMutex.Lock()
    defer writeMutex.Unlock()
    
    for client := range rooms[roomID] {
        err := client.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            log.Println("Write Error:", err)
            client.Close()
            delete(rooms[roomID], client)
        }
    }
}

// ゲーム開始処理
func setupGame(roomID string) {
	time.AfterFunc(time.Second, func() {
		sendMessageAll(roomID, []byte("count3"))
		time.AfterFunc(time.Second, func() {
			sendMessageAll(roomID, []byte("count2"))
			time.AfterFunc(time.Second, func() {
				sendMessageAll(roomID, []byte("count1"))
				time.AfterFunc(time.Second, func() {
					sendMessageAll(roomID, []byte("start"))
					if(currentGame[roomID] == "fermentationGame"){
						return
					}
					timeup(roomID)
				})
			})
		})
	})
}

// タイムアップ処理
func timeup(roomID string) {
	time.AfterFunc(30*time.Second, func() {
		sendMessageAll(roomID, []byte("finish"))
		time.AfterFunc(5*time.Second, func() {
			switch currentGame[roomID] {
			case "pluckTeaGame":
				sendMessageAll(roomID, []byte("fermentationGame"))
				currentGame[roomID] = "fermentationGame"
			case "millstoneGame":
				sendMessageAll(roomID, []byte("resultPage"))
				currentGame[roomID] = "result"
			}
		})
	})
}

// WebSocket 接続を処理
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["roomID"]

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	// ルームがなければ作成し、最初の参加者をホストにする
	if rooms[roomID] == nil {
		rooms[roomID] = make(map[*websocket.Conn]bool)
		currentGame[roomID] = "pluckTeaGame"
		roomHost[roomID] = conn // 最初の参加者をホストにする
		fmt.Println("Room created:", roomID, "Host assigned")
	}

	// 参加者を登録
	rooms[roomID][conn] = true
	if user[roomID] == nil {
		user[roomID] = make(map[*websocket.Conn]string)
	}
	if score[roomID] == nil {
		score[roomID] = make(map[*websocket.Conn]int)
	}
	score[roomID][conn] = 0

	log.Printf("Client connected to room: %s", roomID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read Error:", err)
			delete(rooms[roomID], conn)
			if roomHost[roomID] == conn {
				delete(roomHost, roomID) // ホストが切断されたら削除
			}
			break
		}

		// 送信者のユーザー名を特定
		userName, exists := user[roomID][conn]
		if !exists {
			userName = "UnknownUser"
		}

		// メッセージの処理
		switch {
		case string(msg[:5]) == "score":
			// スコア処理
			scoreValue := (int(msg[5]-'0')*100 + int(msg[6]-'0')*10 + int(msg[7]-'0'))
			userName := string(msg[8:])
			for conn, name := range user[roomID] {
				if name == userName {
					score[roomID][conn] += scoreValue
					fmt.Println("Score:", score[roomID][conn])
				}
			}

		case string(msg[:4]) == "user":
			// ユーザー名の登録
			user[roomID][conn] = string(msg[4:])
			fmt.Println("User:", user[roomID][conn])

		case string(msg) == "nextGame":
			setupGame(roomID)

		case string(msg) == "gameStart":
			// 参加者リストを送信
			userList := ""
			for _, name := range user[roomID] {
				userList += name + "|"
			}
			sendMessageAll(roomID, []byte("userList|" + userList))
			setupGame(roomID)
			sendMessageAll(roomID, []byte("pluckTeaGame"))
		case string(msg) == "result":
			// スコアを送信
			scoreList := ""
			for conn, name := range user[roomID] {
				scoreList += fmt.Sprintf("%s@%d|", name, score[roomID][conn])
			}
			sendMessageAll(roomID, []byte("scoreList|" + scoreList))
			score[roomID] = make(map[*websocket.Conn]int)
			case string(msg) == "millstoneStart":
			// ミルストーンゲーム開始
			sendMessageAll(roomID, []byte("millstoneGame"))
			currentGame[roomID] = "millstoneGame"
		default:
			// ユーザー名付きのメッセージをホストに送信
			formattedMsg := fmt.Sprintf("%s@%s", userName, string(msg))
			sendMessageHost(roomID, []byte(formattedMsg))
		}
	}
}

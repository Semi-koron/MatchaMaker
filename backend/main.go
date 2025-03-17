package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Semikoron/Brachio/backend/millstone"
	"github.com/gorilla/mux"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル環境用デフォルトポート
	}
	
	r := mux.NewRouter()

	// ルーム作成用の API
	r.HandleFunc("/room/{roomID}", millstone.HandleWebSocket)

	serverAddr := ":8080"
	fmt.Println("WebSocket server started on", serverAddr)
	log.Fatal(http.ListenAndServe(serverAddr, r))
}
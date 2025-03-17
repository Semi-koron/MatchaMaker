package main

import (
	"fmt"
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, Go World!")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル環境用デフォルトポート
	}
	http.HandleFunc("/", handler)
	fmt.Println("Server running on port", port)
	http.ListenAndServe(":"+port, nil)
}

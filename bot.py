from fastapi import FastAPI, Query, Response

app = FastAPI()

VERIFY_TOKEN = "aurabilgi123"

@app.get("/webhook")
def verify_webhook(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge")
):
    if mode == "subscribe" and token == VERIFY_TOKEN:
        # Meta'nın kabul etmesi için cevabı mutlaka düz metin (text/plain) döndürüyoruz
        return Response(content=str(challenge), media_type="text/plain", status_code=200)
    return Response(content="Forbidden", status_code=403)

@app.post("/webhook")
async def receive_webhook():
    return Response(content="EVENT_RECEIVED", media_type="text/plain", status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


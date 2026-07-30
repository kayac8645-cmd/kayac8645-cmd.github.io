import os
import requests
from fastapi import FastAPI, Request, Response

app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "aurabilgi123")
PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")

@app.get("/webhook")
async def verify_webhook(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, status_code=200)
    return Response(content="Verification failed", status_code=403)

@app.post("/webhook")
async def handle_webhook(request: Request):
    data = await request.json()
    
    try:
        for entry in data.get("entry", []):
            for messaging_event in entry.get("messaging", []):
                sender_id = messaging_event.get("sender", {}).get("id")
                message = messaging_event.get("message", {})
                text = message.get("text", "").lower()

                if sender_id and text:
                    reply_text = "Merhaba! Ücretsiz ceket detayları ve inceleme videosu için tıklayın: https://instagram.com/reel/ceket_videosu"
                    send_instagram_message(sender_id, reply_text)
    except Exception as e:
        print("Hata:", e)

    return Response(content="EVENT_RECEIVED", status_code=200)

def send_instagram_message(recipient_id: str, text: str):
    if not PAGE_ACCESS_TOKEN:
        print("PAGE_ACCESS_TOKEN bulunamadı!")
        return

    url = f"https://graph.facebook.com/v18.0/me/messages?access_token={PAGE_ACCESS_TOKEN}"
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": text}
    }
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, json=payload, headers=headers)
    print("Mesaj Gönderim Sonucu:", res.json())

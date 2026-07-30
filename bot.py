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
            # Yorum (Comment) veya Etkileşim tetiklemeleri
            changes = entry.get("changes", [])
            for change in changes:
                field = change.get("field")
                value = change.get("value", {})
                
                # Bir gönderiye/videoya yorum yapıldığında
                if field == "comments":
                    comment_id = value.get("id")
                    comment_text = value.get("text", "").lower()
                    
                    if comment_id:
                        # Yorumda ceket veya link soruluyorsa yorumun altına yanıt yaz
                        if any(w in comment_text for w in ["ceket", "link", "ücretsiz", "fiyat", "nereden"]):
                            reply_text = "Merhaba! Ücretsiz ceket detayları ve inceleme videosu için tıklayın: https://instagram.com/reel/ceket_videosu"
                        else:
                            reply_text = "Detaylar ve bilgilendirme için profildeki linke göz atabilirsiniz! 🎯"
                        
                        reply_to_comment(comment_id, reply_text)
                        
    except Exception as e:
        print("Hata:", e)

    return Response(content="EVENT_RECEIVED", status_code=200)

def reply_to_comment(comment_id: str, text: str):
    if not PAGE_ACCESS_TOKEN:
        print("PAGE_ACCESS_TOKEN bulunamadı!")
        return

    url = f"https://graph.facebook.com/v18.0/{comment_id}/replies?access_token={PAGE_ACCESS_TOKEN}"
    payload = {"message": text}
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, json=payload, headers=headers)
    print("Yorum Yanıt Sonucu:", res.json())

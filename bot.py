import os
import requests
from fastapi import FastAPI, Request, Response

app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "aurabilgi123")
PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Render'a ekleyeceğiz

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
            changes = entry.get("changes", [])
            for change in changes:
                field = change.get("field")
                value = change.get("value", {})
                
                # Biri seni bir yorumda etiketlediğinde (mentions) veya normal yorum yapıldığında
                if field in ["mentions", "comments"]:
                    comment_id = value.get("comment_id") or value.get("id")
                    user_text = value.get("text", "")
                    
                    if comment_id and user_text:
                        # Soruyu yapay zekaya gönderip cevap ürettiriyoruz
                        ai_reply = generate_ai_response(user_text)
                        reply_to_comment(comment_id, ai_reply)
                        
    except Exception as e:
        print("Hata:", e)

    return Response(content="EVENT_RECEIVED", status_code=200)

def generate_ai_response(user_text: str) -> str:
    """Gelen mesaja/soruya göre Gemini AI ile akıllı cevap üretir."""
    if not GEMINI_API_KEY:
        return "Etiketlediğiniz için teşekkürler! Sorunuzu inceleyip dönüyorum."
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    prompt = f"Sen samimi, yardımsever bir Instagram asistanısın. Kullanıcı seni bir videoda etiketleyip şu yorumu/soruyu yazdı: '{user_text}'. Buna Instagram yorumu formatında, samimi, kısa ve mantıklı bir cevap ver (maksimum 2 cümle)."
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    try:
        res = requests.post(url, json=payload, timeout=5)
        res_data = res.json()
        reply = res_data['candidates'][0]['content']['parts'][0]['text']
        return reply.strip()
    except Exception as e:
        print("AI Cevap Hatası:", e)
        return "Harika bir paylaşım! Etiketlediğiniz için teşekkürler."

def reply_to_comment(comment_id: str, text: str):
    if not PAGE_ACCESS_TOKEN:
        print("PAGE_ACCESS_TOKEN bulunamadı!")
        return

    url = f"https://graph.facebook.com/v18.0/{comment_id}/replies?access_token={PAGE_ACCESS_TOKEN}"
    payload = {"message": text}
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, json=payload, headers=headers)
    print("Yorum Yanıt Sonucu:", res.json())

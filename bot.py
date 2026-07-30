import os
import requests
from fastapi import FastAPI, Request, Response

app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "aurabilgi123")
PAGE_ACCESS_TOKEN = os.getenv("PAGE_ACCESS_TOKEN")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

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
                
                if field in ["mentions", "comments"]:
                    comment_id = value.get("comment_id") or value.get("id")
                    user_text = value.get("text", "")
                    media_id = value.get("media_id")
                    
                    if comment_id and user_text:
                        # Videonun açıklamasını Meta Graph API ile çekiyoruz
                        caption = get_media_caption(comment_id, media_id)
                        
                        # Yapay zekaya video açıklaması ve soruyu iletip cevap alıyoruz
                        ai_reply = generate_nvidia_ai_response(user_text, caption)
                        reply_to_comment(comment_id, ai_reply)
                        
    except Exception as e:
        print("Hata:", e)

    return Response(content="EVENT_RECEIVED", status_code=200)

def get_media_caption(comment_id: str, media_id: str = None) -> str:
    """Yorum yapılan veya etiketlenen videonun/gönderinin açıklama metnini çekmeye çalışır."""
    if not PAGE_ACCESS_TOKEN:
        return ""
    
    try:
        # Öncelik comment_id üzerinden media bilgilerini çekmek
        url = f"https://graph.facebook.com/v18.0/{comment_id}?fields=text,media{{caption}}&access_token={PAGE_ACCESS_TOKEN}"
        res = requests.get(url, timeout=5)
        res_data = res.json()
        
        caption = res_data.get("media", {}).get("caption", "")
        if caption:
            return caption
            
        # Eğer media_id doğrudan geldiyse oradan dene
        if media_id:
            url_media = f"https://graph.facebook.com/v18.0/{media_id}?fields=caption&access_token={PAGE_ACCESS_TOKEN}"
            res_media = requests.get(url_media, timeout=5)
            return res_media.json().get("caption", "")
            
    except Exception as e:
        print("Media caption çekme hatası:", e)
        
    return ""

def generate_nvidia_ai_response(user_text: str, caption: str = "") -> str:
    """Gelen mesaja ve video açıklamasına göre Nvidia AI (Llama-3) ile akıllı cevap üretir."""
    if not NVIDIA_API_KEY:
        return "Etiketlediğiniz için teşekkürler!"
        
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    context_str = f"Videonun Açıklaması/Metni: '{caption}'\n" if caption else "Video açıklaması mevcut değil.\n"
    user_prompt = f"{context_str}Kullanıcının Yorumu/Sorusu: '{user_text}'"
    
    payload = {
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [
            {
                "role": "system", 
                "content": (
                    "Sen Instagram'da samimi, akıllı ve yardımsever bir asistansın. "
                    "Sana video/gönderi açıklaması (varsa) ve kullanıcının sorduğu soru/yorum verilecek. "
                    "Videonun açıklamasından ve kullanıcının yorumundan yola çıkarak doğru, mantıklı, samimi ve maksimum 2 cümlelik bir yanıt ver."
                )
            },
            {
                "role": "user", 
                "content": user_prompt
            }
        ],
        "temperature": 0.5,
        "max_tokens": 120
    }
    
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=8)
        res_data = res.json()
        reply = res_data['choices'][0]['message']['content']
        return reply.strip()
    except Exception as e:
        print("Nvidia AI Cevap Hatası:", e)
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

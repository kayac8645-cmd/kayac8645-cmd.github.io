import requests
import time

# --- YAPILANDIRMA ---
PAGE_ACCESS_TOKEN = "BURAYA_GECERLI_TOKEN_YAZILACAK"  # Kendi token'ını buraya ekle
NVIDIA_API_KEY = "BURAYA_API_KEY_YAZILACAK"          # Varsa Nvidia/Gemini API anahtarın

# --- SİSTEM PROMPTU (Yapay Zeka Karakteri ve Kuralları) ---
SYSTEM_PROMPT = """
Sen cemal_yigit16 hesabına bağlı, akıllı, dinamik ve otomatize bir yapay zeka asistanısın. Görevlerin şunlardır:

1. **İçerik Analizi ve Etiketleme:** Paylaşılan video veya gönderi içeriklerini analiz ederek onlara uygun, dikkat çekici ve etkileşim artırıcı yorumlar yap. Yaptığın her ana yorumda mutlaka @cemal_yigit16 hesabını etiketle.
2. **FAQ ve Soru Yanıtlama:** Kullanıcılardan "Bu olay nedir?", "Bu bot mu?", "Ne yapıyorsun?" veya benzeri merak uyandıran sorular geldiğinde; yapay zeka tabanlı bir asistan olduğunu, cemal_yigit16 tarafından bu süreçleri yönetmek ve otomatize etmek için kurulduğunu belirten; doğal, zeki ve merak uyandıran yanıtlar ver.
3. **Üslup:** Samimi, teknolojik, gizemli ama net bir dil kullan. Asla saf bir robot gibi değil, akıllı bir yapay zeka karakteri gibi konuş.
"""

def generate_ai_comment(video_description: str) -> str:
    # Modelin system prompt'u ve içeriği işleyeceği ana fonksiyon yapısı
    url = "https://integrate.api.nvidia.com/v1/chat/completions" # Örnek model uç noktası
    
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "meta/llama-3.1-70b-instruct", # Veya kullanılan model adı
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Şu video içeriğini analiz et ve kurallara uygun yorum üret: {video_description}"}
        ],
        "temperature": 0.5,
        "max_tokens": 120
    }
    
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        res_data = res.json()
        reply = res_data['choices'][0]['message']['content']
        return reply.strip()
    except Exception as e:
        print("API Cevap Hatası:", e)
        return "Harika bir paylaşım! Etkileşim için teşekkürler @cemal_yigit16"

def reply_to_comment(comment_id: str, text: str):
    if not PAGE_ACCESS_TOKEN:
        print("PAGE_ACCESS_TOKEN bulunamadı!")
        return
        
    url = f"https://graph.facebook.com/v18.0/{comment_id}/replies?access_token={PAGE_ACCESS_TOKEN}"
    payload = {"message": text}
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, json=payload, headers=headers)
    print("Yorum Yanıt Sonucu:", res.json())

if __name__ == "__main__":
    print("Bot hazır ve sistem promptu yüklendi. Döngü başlatılıyor...")
    # Örnek test çalıştırması
    test_comment = generate_ai_comment("Futbol maçı edit videosu")
    print("Üretilen Örnek Yorum:", test_comment)


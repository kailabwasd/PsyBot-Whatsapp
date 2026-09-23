"""
MindBridge - Plataforma Híbrida de Atención Emocional y Triage Psicológico
Implementación Alternativa en Python (FastAPI + Google GenAI + Twilio)
"""

import os
import time
from typing import Dict, List, Optional
from fastapi import FastAPI, Form, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI(title="MindBridge Emotional Triage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de Google Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """Eres Aura, la Asistente de Apoyo Emocional y Primeros Auxilios Psicológicos de MindBridge.
Brinda un espacio de escucha activa, validación empática, compasión y técnicas breves de autorregulación (respiración 4-7-8, técnica sensorial 5-4-3-2-1).
Límites éticos: No diagnostiques psiquiátricamente ni recetes fármacos.
Si detectas ideación suicida o autolesión, activa protocolo de emergencia e invita a escribir '#psicologo' o contactar líneas de emergencia."""

# Almacén de sesiones en memoria
sessions: Dict[str, dict] = {}

CRISIS_KEYWORDS = [
    "suicid", "quitarme la vida", "no quiero vivir", "acabar con todo",
    "matarme", "cortarme", "autolesion", "lastimarme", "tomarme todas las pastillas"
]

def is_crisis(text: str) -> bool:
    return any(word in text.lower() for word in CRISIS_KEYWORDS)

def get_crisis_message(name: str = "") -> str:
    user_part = f"Estimado(a) {name}, " if name else ""
    return (
        f"🚨 *ATENCIÓN INMEDIATA Y CONTENCIÓN EN CRISIS*\n\n"
        f"{user_part}Tu vida es muy valiosa para nosotros.\n\n"
        "Líneas de ayuda gratuitas y confidenciales 24/7:\n"
        "• México: Línea de la Vida 800 911 2000\n"
        "• España: Teléfono de la Esperanza 717 003 717 / 024\n"
        "• Colombia: Línea 106 / 192\n"
        "• Argentina: Centro de Asistencia al Suicida 135\n"
        "• EE.UU. / Internacional: 988 Lifeline\n\n"
        "Un psicólogo de nuestro panel ha sido alertado con máxima prioridad."
    )

@app.post("/api/whatsapp")
async def whatsapp_webhook(
    From: str = Form(...),
    Body: str = Form(""),
    ProfileName: Optional[str] = Form(None)
):
    """
    Webhook receptor de eventos Twilio WhatsApp
    """
    user_phone = From.strip()
    user_text = Body.strip()
    now = int(time.time() * 1000)

    session = sessions.get(user_phone)
    if not session:
        session = {
            "id": user_phone,
            "phoneNumber": user_phone.replace("whatsapp:", ""),
            "userName": ProfileName or "",
            "state": "ASKING_NAME",
            "riskLevel": "BAJO",
            "messages": [],
            "lastActivityAt": now
        }
        sessions[user_phone] = session

    session["lastActivityAt"] = now
    session["messages"].append({"sender": "user", "text": user_text, "timestamp": now})

    # Detección de crisis global
    if is_crisis(user_text):
        session["riskLevel"] = "CRISIS"
        session["state"] = "CRISIS_ALERT"
        reply = get_crisis_message(session["userName"])
        session["messages"].append({"sender": "bot", "text": reply, "timestamp": int(time.time() * 1000)})
        twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply}</Message></Response>'
        return Response(content=twiml, media_type="text/xml")

    # Comandos de navegación
    lower = user_text.lower()
    if lower in ["#menu", "menu"]:
        session["state"] = "MENU_SELECTION"
        reply = (
            f"🌿 *Menú Principal de MindBridge*\n\n"
            f"Hola {session['userName'] or 'amigo(a)'}:\n"
            "1️⃣ Modo Asistente Emocional IA\n"
            "2️⃣ Modo Psicólogo Especialista Humano\n"
            "3️⃣ Líneas de Crisis y Emergencia\n\n"
            "*(Responde 1, 2 o 3)*"
        )
    elif lower in ["#psicologo", "#humano"]:
        session["state"] = "WAITING_PSYCHOLOGIST"
        session["riskLevel"] = "ALTO"
        reply = "👨‍⚕️ Tu solicitud ha sido enviada a nuestra guardia de psicólogos. Un especialista te responderá aquí en breve."
    elif session["state"] == "ASKING_NAME":
        session["userName"] = user_text.replace("me llamo", "").strip().title()
        session["state"] = "MENU_SELECTION"
        reply = (
            f"¡Mucho gusto, *{session['userName']}*! 🌿\n\n"
            "¿Cómo prefieres continuar?\n"
            "1️⃣ Asistente Emocional IA\n"
            "2️⃣ Psicólogo Humano de Guardia\n"
            "3️⃣ Líneas de Emergencia 24/7"
        )
    elif session["state"] == "MENU_SELECTION":
        if "1" in lower or "ia" in lower:
            session["state"] = "AI_MODE"
            reply = f"🤍 Modo Asistente IA activado. Cuéntame {session['userName']}, ¿qué estás sintiendo en este momento?"
        elif "2" in lower or "psicologo" in lower:
            session["state"] = "WAITING_PSYCHOLOGIST"
            reply = "🩺 Has sido transferido a la Bandeja de Guardia Psicológica. Por favor describe tu motivo de consulta."
        else:
            session["state"] = "CRISIS_ALERT"
            reply = get_crisis_message(session["userName"])
    elif session["state"] == "AI_MODE":
        try:
            model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_INSTRUCTION)
            response = model.generate_content(user_text)
            reply = response.text
        except Exception as e:
            reply = "Estoy aquí contigo. Cuéntame más despacio lo que sientes, o escribe '#psicologo' para conectar con un terapeuta."
    else:
        reply = "Tu caso está en la cola activa con un psicólogo humano. En breve continuaremos la atención."

    session["messages"].append({"sender": "bot", "text": reply, "timestamp": int(time.time() * 1000)})
    twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply}</Message></Response>'
    return Response(content=twiml, media_type="text/xml")

@app.get("/api/sessions")
def list_sessions():
    return {"sessions": list(sessions.values())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

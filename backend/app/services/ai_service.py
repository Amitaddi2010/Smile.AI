"""
SMILE-AI AI Service
Integrates with Groq LLM for intelligent insights and support.
"""
from groq import Groq
from datetime import datetime
import traceback
from ..config import settings
import logging

log = logging.getLogger("smile.ai")

class AIService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"

    def get_completion(self, prompt: str, system_prompt: str = ""):
        """Get a completion from the Groq LLM."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_completion_tokens=1024,
                top_p=1,
                stream=False
            )
            return completion.choices[0].message.content
        except Exception as e:
            log.error(f"Groq API Error: {str(e)}")
            return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."

    def analyze_wellbeing(self, assessment_summary: str):
        """Analyze student wellbeing with strict word counts and absolute precision."""
        system_prompt = (
            "You are a Senior Clinical Psychologist at SMILE-AI. "
            "Provide a precise Clinical Narrative based on student telemetry data. "
            "### ABSOLUTE CONSTRAINTS:\n"
            "1. NO ASTERISKS: DO NOT use asterisks (*) for any reason.\n"
            "2. NO MARKDOWN: DO NOT use ###, ##, or ** symbols.\n"
            "3. WORD COUNTS PER SECTION: Exactly 40-50 words each.\n"
            "4. HEADINGS: Use ALL CAPS headings only.\n"
            "5. LISTS: Use simple dashes (-) only.\n\n"
            "### REQUIRED STRUCTURE:\n"
            "ANALYSIS OVERVIEW\n"
            "Develop a 50-word synthesis of current mental state and risk profile.\n\n"
            "RED FLAGS\n"
            "Develop a 50-word breakdown of 2-3 specific behavioral risk triggers.\n\n"
            "GREEN FLAGS\n"
            "Develop a 50-word breakdown of 2-3 specific protective factors found in data.\n\n"
            "RECOMMENDATIONS\n"
            "Develop a 50-word strategic protocol for recovery and improvement.\n\n"
            "Note: You are an AI, mention this. Recommend university services for crisis."
        )
        return self.get_completion(assessment_summary, system_prompt)

    def generate_speech(self, text: str):
        """Generate speech using Groq Orpheus model."""
        try:
            # We use the canopy labs orpheus model for English
            response = self.client.audio.speech.create(
                model="canopylabs/orpheus-v1-english",
                voice="autumn", # Using 'autumn' as discovered in research
                input=text,
            )
            # The response.content contains the binary audio data (WAV)
            return response.content
        except Exception as e:
            tb = traceback.format_exc()
            err_msg = f"Groq TTS Error ({type(e).__name__}): {str(e)}"
            if hasattr(e, 'body'):
                err_msg += f" | Body: {e.body}"
            
            with open("debug_tts.log", "a") as f:
                f.write(f"{datetime.now()}: {err_msg}\nTraceback:\n{tb}\n")
            
            log.error(err_msg)
            return None

# Singleton instance
ai_service = AIService()

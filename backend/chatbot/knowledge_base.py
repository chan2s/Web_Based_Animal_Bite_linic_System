"""
Clinic Knowledge Base — rule-based Q&A engine for the chatbot.

Provides 100% offline, static responses matched against user keywords.
To switch to an LLM provider later, replace the `get_response()` function with
an API call while keeping the same input/output contract.
"""

import re

# =============================================================================
# PREDEFINED RESPONSES
# =============================================================================

KNOWLEDGE = {
    "greeting": {
        "keywords": ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
        "questions": [],
        "answer": "Hello! 👋 Welcome to the Animal Bite Clinic System. I'm your virtual assistant. How can I help you today?",
    },
    "hours": {
        "keywords": ["hours", "opening hours", "clinic hours", "open", "close", "schedule", "operating hours"],
        "questions": [],
        "answer": "🕒 Our clinic is open Monday to Saturday from 8:00 AM to 6:00 PM. Please arrive early if you're coming for vaccination or treatment.",
    },
    "location": {
        "keywords": ["where", "location", "address", "map", "clinic", "directions"],
        "questions": [],
        "answer": "📍 We are located at Peping Gamo Street, Bayawan City, Negros Oriental. You can also view our location on the interactive map on the landing page.",
    },
    "appointments": {
        "keywords": ["appointment", "book", "booking", "reserve", "schedule"],
        "questions": [],
        "answer": "📅 You can book an appointment by logging into your account and selecting 'Book Appointment' from the dashboard menu.",
    },
    "rabies": {
        "keywords": ["rabies", "virus", "infected", "disease"],
        "questions": [],
        "answer": "Rabies is a viral disease that affects the nervous system and is almost always fatal once symptoms appear. If you are bitten by an animal, wash the wound immediately and seek medical attention as soon as possible.",
    },
    "first_aid": {
        "keywords": ["bite", "bitten", "first aid", "wound", "bleeding"],
        "questions": [],
        "answer": "🩹 Immediately wash the wound thoroughly with soap and running water for at least 15 minutes. Apply an antiseptic if available, avoid traditional remedies, and visit the clinic immediately for evaluation.",
    },
    "vaccines": {
        "keywords": ["vaccine", "vaccination", "anti rabies", "injection", "pep", "prep"],
        "questions": [],
        "answer": "💉 The clinic provides Anti-Rabies Vaccination and Post-Exposure Prophylaxis (PEP). A healthcare professional will determine the appropriate vaccination schedule based on your exposure.",
    },
    "contact_staff": {
        "keywords": [
            "contact staff", "talk to staff", "talk to a person", "talk to human",
            "speak to staff", "real person", "customer service", "agent",
            "speak to someone", "live chat", "call me", "staff", "doctor",
            "veterinarian", "nurse", "help",
        ],
        "questions": [],
        "answer": "👨‍⚕️ If you need assistance from our staff, you can use the Messages section in your dashboard or call the clinic during operating hours.",
    },
    "registration": {
        "keywords": ["register", "signup", "sign up", "account"],
        "questions": [],
        "answer": "📝 To create an account, click the Get Started button on the landing page and complete the registration form. You'll receive an email verification code before your account is activated.",
    },
    "login": {
        "keywords": ["login", "sign in", "password", "forgot password"],
        "questions": [],
        "answer": "🔐 You can sign in using your registered email and password. If you've forgotten your password, use the Forgot Password option on the login page.",
    },
    "profile": {
        "keywords": ["profile", "personal information", "contact number", "update profile"],
        "questions": [],
        "answer": "👤 You can update your personal information anytime by visiting My Profile after logging in.",
    },
    "thanks": {
        "keywords": ["thank you", "thanks", "ty"],
        "questions": [],
        "answer": "😊 You're welcome! If you have any other questions, feel free to ask.",
    },
}

CONTACT_STAFF_MESSAGE = "👨‍⚕️ If you need assistance from our staff, you can use the Messages section in your dashboard or call the clinic during operating hours."

FALLBACK_RESPONSE = "I'm sorry, I don't have information about that yet. Please contact our clinic staff through the Messages page or ask another question related to our clinic services."


def _normalize(text):
    """Lowercase, strip, remove punctuation for matching."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)
    return text


def get_response(user_message, conversation_history=None):
    """
    Main entry point. Returns the chatbot's response to a user message.

    Uses simple keyword matching against predefined responses.
    Returns static responses — no external API calls.

    Args:
        user_message: The user's latest message (string).
        conversation_history: Currently unused (kept for future context-aware enhancements).

    Returns:
        dict with:
            - 'response': The response text (string).
            - 'should_contact_staff': Whether the user should be offered
              staff contact (bool).
    """
    message = _normalize(user_message)

    # Check if user is asking to contact staff (fast path)
    for phrase in KNOWLEDGE["contact_staff"]["keywords"]:
        if phrase in message:
            return {
                "response": CONTACT_STAFF_MESSAGE,
                "should_contact_staff": True,
            }

    # Score each category by keyword matches
    best_category = None
    best_score = 0

    for category_id, category in KNOWLEDGE.items():
        score = 0
        for keyword in category["keywords"]:
            normalized_keyword = _normalize(keyword)
            if " " in normalized_keyword:
                # Multi-word phrase
                if normalized_keyword in message:
                    score += 3
            else:
                # Single word: check for exact, prefix, and substring matches
                words = message.split()
                for word in words:
                    if word == normalized_keyword:
                        score += 3
                    elif word.startswith(normalized_keyword) or normalized_keyword.startswith(word):
                        score += 1
                if normalized_keyword in message:
                    score += 1

        if score > best_score:
            best_score = score
            best_category = category_id

    # Threshold for matching
    if best_score >= 3 and best_category:
        return {
            "response": KNOWLEDGE[best_category]["answer"],
            "should_contact_staff": False,
        }

    # Fallback — no match found
    return {
        "response": FALLBACK_RESPONSE,
        "should_contact_staff": True,
    }

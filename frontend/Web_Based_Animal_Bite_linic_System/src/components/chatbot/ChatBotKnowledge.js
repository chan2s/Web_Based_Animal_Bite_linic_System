/**
 * Frontend Knowledge Base & Rule-Based Matching Engine
 * =====================================================
 * 100% offline — no external API calls.
 * Matches user questions against predefined keywords and returns static responses.
 *
 * To integrate a real AI model later, replace `getLocalResponse()` with an API call
 * while keeping the same input/output contract.
 */

import RESPONSES, { FALLBACK_RESPONSE } from './responses';

// ============================================================================
// TEXT NORMALISATION
// ============================================================================

function normalize(text) {
  // Lowercase, strip whitespace, remove punctuation
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '');
}

function tokenize(text) {
  // Split into words, filter empty strings
  return normalize(text)
    .split(/\s+/)
    .filter(Boolean);
}

// ============================================================================
// MATCHING LOGIC
// ============================================================================

/**
 * Score how well a message matches a set of keywords.
 * Returns a score based on number/quality of keyword matches.
 */
function scoreKeywords(message, keywords) {
  const normalizedMessage = normalize(message);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);

    if (normalizedKeyword.includes(' ')) {
      // Multi-word phrase: count if contained in message
      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 3; // Phrase match = strong signal
      }
    } else {
      const words = tokenize(message);
      for (const word of words) {
        if (word === normalizedKeyword) {
          score += 3; // Exact word match = strongest
        } else if (word.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(word)) {
          score += 1; // Partial/stem match = weaker but useful
        }
      }
      // Substring match anywhere in message
      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 1;
      }
    }
  }

  return score;
}

// ============================================================================
// PUBLIC API — Local Response Engine
// ============================================================================

/**
 * Get a local rule-based response for a user message.
 *
 * @param {string} message - The user's message.
 * @param {Array} [conversationHistory] - Previous messages (unused in basic matching but kept
 *   for future context-aware enhancements).
 * @returns {{ response: string, shouldContactStaff: boolean, intentId: string | null }}
 */
export function getLocalResponse(message, conversationHistory = []) {
  if (!message || typeof message !== 'string') {
    return {
      response: FALLBACK_RESPONSE,
      shouldContactStaff: true,
      intentId: null,
    };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return {
      response: FALLBACK_RESPONSE,
      shouldContactStaff: true,
      intentId: null,
    };
  }

  // Score each intent by keyword matches
  let bestIntent = null;
  let bestScore = 0;

  for (const intent of RESPONSES) {
    const score = scoreKeywords(trimmed, intent.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Threshold: at least one solid keyword match
  if (bestScore >= 3 && bestIntent) {
    return {
      response: bestIntent.response,
      shouldContactStaff: bestIntent.shouldContactStaff,
      intentId: bestIntent.id,
    };
  }

  // Fallback — no match found
  return {
    response: FALLBACK_RESPONSE,
    shouldContactStaff: true,
    intentId: null,
  };
}

/**
 * Check if the user is specifically asking to contact staff.
 */
export function isContactStaffRequest(message) {
  const contactKeywords = [
    'contact staff',
    'talk to staff',
    'talk to a person',
    'talk to human',
    'speak to staff',
    'real person',
    'customer service',
    'agent',
    'speak to someone',
    'live chat',
    'call me',
  ];

  const normalizedMessage = normalize(message);
  for (const keyword of contactKeywords) {
    if (normalizedMessage.includes(normalize(keyword))) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// SESSION PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'chatbot_conversation';

/**
 * Save the current conversation to localStorage.
 */
export function saveConversation(messages) {
  try {
    const data = messages.map((m) => ({
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

/**
 * Load a saved conversation from localStorage.
 * @returns {Array} Array of message objects, or empty array if none saved.
 */
export function loadConversation() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * Clear the saved conversation from localStorage.
 */
export function clearConversation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}

// ============================================================================
// SUGGESTED QUESTIONS
// ============================================================================

/** Flat list of suggested questions (kept for backwards compatibility). */
export const SUGGESTED_QUESTIONS = [
  { id: 'first_aid', question: 'What should I do after an animal bite?' },
  { id: 'vaccines', question: 'What vaccines do you offer?' },
  { id: 'appointment', question: 'How do I book an appointment?' },
  { id: 'hours', question: 'What are your clinic hours?' },
  { id: 'location', question: 'Where is the clinic located?' },
  { id: 'contact_staff', question: 'Contact a staff member' },
];

/**
 * Categorized suggested questions for the collapsible quick-panel.
 * Each category groups relevant questions under a label and icon.
 */
export const CATEGORIZED_QUESTIONS = [
  {
    id: 'appointments',
    label: 'Appointments',
    icon: '📅',
    questions: [
      { id: 'appointment_book', question: 'How do I book an appointment?' },
      { id: 'appointment_reschedule', question: 'Can I reschedule my appointment?' },
      { id: 'appointment_cancel', question: 'How do I cancel my appointment?' },
    ],
  },
  {
    id: 'vaccination',
    label: 'Vaccination',
    icon: '💉',
    questions: [
      { id: 'vaccines_available', question: 'What vaccines are available?' },
      { id: 'vaccines_doses', question: 'How many doses are required?' },
      { id: 'vaccines_cost', question: 'How much does vaccination cost?' },
    ],
  },
  {
    id: 'animal_bite',
    label: 'Animal Bite',
    icon: '🐶',
    questions: [
      { id: 'bite_first_aid', question: 'What should I do right after a bite?' },
      { id: 'rabies_danger', question: 'Is rabies dangerous?' },
      { id: 'bite_visit', question: 'When should I visit the clinic?' },
    ],
  },
  {
    id: 'clinic_info',
    label: 'Clinic Information',
    icon: '📍',
    questions: [
      { id: 'clinic_location', question: 'Where are you located?' },
      { id: 'clinic_hours', question: 'What are your operating hours?' },
      { id: 'clinic_contact', question: 'How can I contact the clinic?' },
    ],
  },
];

// ============================================================================
// BACKWARD COMPATIBILITY — Async wrappers that use the local engine
// ============================================================================

/**
 * Kept for backward compatibility with ChatBotWindow.jsx.
 * Uses the local rule-based engine instead of calling the backend API.
 */
export async function sendChatMessage(message, conversationId = null) {
  const result = getLocalResponse(message);
  return {
    response: result.response,
    shouldContactStaff: result.shouldContactStaff,
    intentId: result.intentId,
  };
}

export async function getChatHistory() {
  return [];
}

export async function getChatConversation(conversationId) {
  return null;
}

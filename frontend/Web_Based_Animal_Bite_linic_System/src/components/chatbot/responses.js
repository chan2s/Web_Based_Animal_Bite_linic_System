/**
 * Chatbot Response Configuration
 * ================================
 * All predefined responses organized by intent.
 * Easy to add, edit, or replace responses when integrating a real AI model later.
 *
 * Each intent has:
 *   - keywords: Array of terms that trigger this response
 *   - response: The static reply text
 *   - shouldContactStaff: Whether to show "Contact Staff" CTA
 */

const RESPONSES = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! 👋 Welcome to the Animal Bite Clinic System. I'm your virtual assistant. How can I help you today?",
    shouldContactStaff: false,
  },
  {
    id: 'hours',
    keywords: ['hours', 'opening hours', 'clinic hours', 'open', 'close', 'schedule', 'operating hours'],
    response: "🕒 Our clinic is open Monday to Saturday from 8:00 AM to 6:00 PM. Please arrive early if you're coming for vaccination or treatment.",
    shouldContactStaff: false,
  },
  {
    id: 'location',
    keywords: ['where', 'location', 'address', 'map', 'clinic', 'directions'],
    response: "📍 We are located at Peping Gamo Street, Bayawan City, Negros Oriental. You can also view our location on the interactive map on the landing page.",
    shouldContactStaff: false,
  },
  {
    id: 'appointments',
    keywords: ['appointment', 'book', 'booking', 'reserve', 'schedule'],
    response: "📅 You can book an appointment by logging into your account and selecting 'Book Appointment' from the dashboard menu.",
    shouldContactStaff: false,
  },
  {
    id: 'rabies',
    keywords: ['rabies', 'virus', 'infected', 'disease'],
    response:
      "Rabies is a viral disease that affects the nervous system and is almost always fatal once symptoms appear. If you are bitten by an animal, wash the wound immediately and seek medical attention as soon as possible.",
    shouldContactStaff: false,
  },
  {
    id: 'first_aid',
    keywords: ['bite', 'bitten', 'first aid', 'wound', 'bleeding'],
    response:
      "🩹 Immediately wash the wound thoroughly with soap and running water for at least 15 minutes. Apply an antiseptic if available, avoid traditional remedies, and visit the clinic immediately for evaluation.",
    shouldContactStaff: false,
  },
  {
    id: 'vaccines',
    keywords: ['vaccine', 'vaccination', 'anti rabies', 'injection', 'pep', 'prep'],
    response:
      "💉 The clinic provides Anti-Rabies Vaccination and Post-Exposure Prophylaxis (PEP). A healthcare professional will determine the appropriate vaccination schedule based on your exposure.",
    shouldContactStaff: false,
  },
  {
    id: 'contact_staff',
    keywords: [
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
      'staff',
      'doctor',
      'veterinarian',
      'nurse',
      'help',
    ],
    response:
      "👨‍⚕️ If you need assistance from our staff, you can use the Messages section in your dashboard or call the clinic during operating hours.",
    shouldContactStaff: true,
  },
  {
    id: 'registration',
    keywords: ['register', 'signup', 'sign up', 'account'],
    response:
      "📝 To create an account, click the Get Started button on the landing page and complete the registration form. You'll receive an email verification code before your account is activated.",
    shouldContactStaff: false,
  },
  {
    id: 'login',
    keywords: ['login', 'sign in', 'password', 'forgot password'],
    response:
      "🔐 You can sign in using your registered email and password. If you've forgotten your password, use the Forgot Password option on the login page.",
    shouldContactStaff: false,
  },
  {
    id: 'profile',
    keywords: ['profile', 'personal information', 'contact number', 'update profile'],
    response:
      "👤 You can update your personal information anytime by visiting My Profile after logging in.",
    shouldContactStaff: false,
  },
  {
    id: 'thanks',
    keywords: ['thank you', 'thanks', 'ty'],
    response: "😊 You're welcome! If you have any other questions, feel free to ask.",
    shouldContactStaff: false,
  },
];

export default RESPONSES;

export const FALLBACK_RESPONSE =
  "I'm sorry, I don't have information about that yet. Please contact our clinic staff through the Messages page or ask another question related to our clinic services.";

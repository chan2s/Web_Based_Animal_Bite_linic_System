import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIZED_QUESTIONS } from './ChatBotKnowledge';

// ─── Animation Variants ────────────────────────────────────────────────────

const panelVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.25, ease: 'easeOut' },
  }),
};

const questionVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.03 * i, duration: 0.2, ease: 'easeOut' },
  }),
};

// ─── Toggle Button ─────────────────────────────────────────────────────────

export function QuickToggle({ isOpen, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="
        flex items-center gap-2
        px-3.5 py-2
        text-xs font-semibold
        text-blue-700 bg-blue-50
        rounded-xl
        border border-blue-100
        hover:bg-blue-100 hover:border-blue-200
        transition-all duration-200
        shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-200
      "
      aria-label={isOpen ? 'Hide quick questions' : 'Show quick questions'}
    >
      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
      <span>Quick Questions</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
      </motion.div>
    </motion.button>
  );
}

// ─── Empty State Suggestions (initial greeting - flat, compact) ────────────

export function InitialSuggestions({ onSelect }) {
  return (
    <div className="px-5 py-1">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Lightbulb className="w-3 h-3 text-amber-500" />
        </div>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Try asking
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIZED_QUESTIONS.flatMap((cat) =>
          cat.questions.slice(0, 2)
        ).map((q) => (
          <motion.button
            key={q.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(q.question)}
            className="
              text-left
              px-3 py-2
              text-xs font-medium
              text-gray-600
              bg-white
              rounded-xl
              border border-gray-100
              shadow-sm
              hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700
              transition-all duration-200
            "
          >
            {q.question}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Full Categorized Panel (collapsible) ──────────────────────────────────

export default function SuggestedQuestions({ onSelect, isExpanded }) {
  if (!isExpanded) return null;

  return (
    <motion.div
      key="quick-panel"
      initial="collapsed"
      animate="expanded"
      exit="collapsed"
      variants={panelVariants}
      className="overflow-hidden"
    >
      <div className="px-5 py-3 space-y-3">
        {CATEGORIZED_QUESTIONS.map((category, catIdx) => (
          <motion.div
            key={category.id}
            custom={catIdx}
            variants={categoryVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Category Header */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">{category.icon}</span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {category.label}
              </span>
            </div>

            {/* Questions */}
            <div className="space-y-1">
              {category.questions.map((q, qIdx) => {
                const globalIdx = catIdx * 10 + qIdx;
                return (
                  <motion.button
                    key={q.id}
                    custom={globalIdx}
                    variants={questionVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(q.question)}
                    className="
                      w-full text-left
                      flex items-center gap-2
                      px-3 py-2
                      text-sm
                      text-gray-600
                      bg-white
                      rounded-lg
                      border border-gray-50
                      hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-100
                    "
                    aria-label={q.question}
                  >
                    <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <span>{q.question}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

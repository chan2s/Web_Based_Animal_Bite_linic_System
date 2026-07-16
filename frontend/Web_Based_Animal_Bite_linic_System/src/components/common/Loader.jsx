import { motion } from 'framer-motion';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="text-sm text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}

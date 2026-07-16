import { useState, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

function InputField({
  id,
  label,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  error = '',
  success = false,
  disabled = false,
  icon = null,
  autoComplete = 'off',
  autoFocus = false,
  placeholder = '',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const shakeKeyframes = useMemo(() => ({ x: [0, -6, 6, -4, 4, -2, 2, 0] }), []);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const IconComponent = icon === 'mail' ? Mail : icon === 'lock' ? Lock : null;

  return (
    <motion.div
      className="relative"
      animate={error ? shakeKeyframes : {}}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <div className="relative">
        {/* Input container */}
        <div
          className={`
            relative flex items-center rounded-xl border
            transition-all duration-200 ease-out
            ${error ? 'border-red-300 bg-red-50/40' : ''}
            ${success ? 'border-emerald-300 bg-emerald-50/20' : ''}
            ${!error && !success && isFocused ? 'border-blue-400 bg-white shadow-sm shadow-blue-100' : ''}
            ${!error && !success && !isFocused ? 'border-slate-200 bg-white hover:border-slate-300' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
        >
          {/* Left icon */}
          {IconComponent && (
            <div className="absolute left-3.5 z-10 pointer-events-none">
              <IconComponent
                className={`w-4 h-4 transition-colors duration-200 ${isFocused && !error ? 'text-blue-500' : error ? 'text-red-400' : 'text-slate-400'}`}
              />
            </div>
          )}

          {/* Label */}
          <label
            htmlFor={id}
            className={`
              absolute pointer-events-none select-none
              transition-all duration-200 ease-out
              ${isFloating
                ? `-top-2.5 ${IconComponent ? 'left-9' : 'left-3'} text-[11px] font-medium`
                : `top-1/2 -translate-y-1/2 ${IconComponent ? 'left-10' : 'left-3.5'} text-sm`
              }
              ${error && isFloating ? 'text-red-500' : ''}
              ${success && isFloating ? 'text-emerald-500' : ''}
              ${!error && !success && isFloating ? 'text-blue-500' : ''}
              ${!error && !success && !isFloating ? (hasValue ? 'text-slate-500' : 'text-slate-400') : ''}
            `}
            style={{
              background: isFloating
                ? error
                  ? 'linear-gradient(to bottom, transparent 40%, #fef2f2 40%)'
                  : success
                  ? 'linear-gradient(to bottom, transparent 40%, #f0fdf4 40%)'
                  : 'linear-gradient(to bottom, transparent 40%, white 40%)'
                : 'transparent',
              padding: isFloating ? '0 5px' : '0',
            }}
          >
            {label}
          </label>

          {/* Input */}
          <input
            ref={inputRef}
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            placeholder={isFloating && !isPassword ? placeholder : ''}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`
              w-full bg-transparent text-sm text-slate-800
              font-medium placeholder:text-slate-400
              outline-none border-none ring-0
              transition-all duration-200
              ${IconComponent ? 'pl-10' : 'pl-3.5'}
              ${isPassword ? 'pr-10' : 'pr-3.5'}
              py-3
              ${error ? 'text-red-700' : ''}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600
                         transition-colors duration-200 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-blue-400"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Success check */}
          {success && !error && !isPassword && (
            <div className="absolute right-3.5 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
            role="alert"
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(InputField);

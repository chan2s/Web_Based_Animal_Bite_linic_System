import { Cross, Heart, Mail, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FOOTER_LINKS = {
  Product: ['Features', 'How It Works', 'FAQ'],
  Company: ['About', 'Blog', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  const navigate = useNavigate();

  const handleClick = (label) => {
    if (label === 'Features') document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    else if (label === 'How It Works') document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
    else if (label === 'Contact') document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    else if (label === 'About') document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cross className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-lg tracking-tight">
                Animal<span className="text-blue-600">Bite</span>Clinic
              </span>
            </button>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
              A comprehensive management system designed for animal bite treatment clinics. Streamline operations, track vaccinations, and save lives.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="mailto:contact@animalbiteclinic.com" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
              <a href="tel:+1234567890" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="lg:col-span-2 lg:col-start-7 lg:col-end-10">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => handleClick(link)}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Get Started</h3>
            <p className="text-sm text-gray-500 mb-4">Ready to transform your clinic?</p>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AnimalBiteClinic System. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
}

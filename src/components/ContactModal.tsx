import React, { useState } from 'react';
import {
  X,
  Mail,
  Linkedin,
  MessageCircle,
  Send,
  CheckCircle2,
  User,
  ExternalLink,
  Globe,
  Share2,
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
        onClose();
      }, 2200);
    }, 600);
  };

  return (
    <div
      id="contact-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="contact-modal-container"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 sm:p-6 relative">
          <button
            id="close-contact-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close contact modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs border border-white/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Contact & Profiles
              </h2>
              <p className="text-xs sm:text-sm text-blue-100">
                NTechBay-Library by Nitish Khobragade
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Creator Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                NK
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                  Nitish Khobragade (NK)
                </h4>
                <p className="text-xs text-slate-500">
                  Creator & Administrator • NTechBay Platform
                </p>
              </div>
            </div>

            {/* Other Profiles & Direct Connections (No GitHub repo link) */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
              <a
                href="https://www.linkedin.com/in/nitishkhobragade"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Connect with Nitish Khobragade on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-blue-200" />
              </a>

              <a
                href="https://wa.me/?text=Hello%20Nitish,%20I%20am%20contacting%20you%20regarding%20NTechBay%20Library%20resources"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>

              <a
                href="mailto:djnitish97@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (djnitish97@gmail.com)</span>
              </a>
            </div>
          </div>

          {/* Feedback & Subject Request Form */}
          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Message Sent!</h4>
              <p className="text-xs text-emerald-700">
                Thank you for your feedback! Your request has been forwarded to Nitish Khobragade.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Send Query or Request Study Material
              </h4>

              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Message or Requested Subject
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={3}
                  placeholder="Need 4th sem structural analysis papers or specific notes..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-contact-button"
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-75"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

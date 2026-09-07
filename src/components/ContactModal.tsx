import React, { useState } from 'react';
import {
  X,
  Mail,
  Linkedin,
  Github,
  Instagram,
  Globe,
  MessageCircle,
  Send,
  CheckCircle2,
  User,
  ExternalLink,
  AlertCircle,
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      // 100% Free FormSubmit Mail API sending directly to djnitish97@gmail.com
      const response = await fetch('https://formsubmit.co/ajax/djnitish97@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          _subject: `NTechBay-Library: New Inquiry from ${formData.name.trim()}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success !== 'false') {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(result.message || 'Failed to send message via mail server');
      }
    } catch (err: any) {
      console.warn('Mail server submission error, offering direct mailto/WhatsApp fallback:', err);
      setSubmitError(
        'Direct server dispatch was blocked by network or adblocker. Click below to send directly via Gmail or WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(`NTechBay Library Query from ${formData.name || 'Student'}`);
    const body = encodeURIComponent(
      `${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
    );
    window.open(`mailto:djnitish97@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenWhatsApp = () => {
    let text = "Hello Admin Nitish Sir, I have contacted you from RGPV E Library Website Online";
    if (formData.message) {
      text += `. Query from ${formData.name || 'Student'}: ${formData.message}`;
    }
    window.open(`https://wa.me/918982324497?text=${encodeURIComponent(text)}`, '_blank');
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

            {/* Profiles & Direct Connections */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
              <a
                href="https://in.linkedin.com/in/nitishkhobragade"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="LinkedIn Profile: Nitish Khobragade"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-blue-200" />
              </a>

              <a
                href="https://github.com/nitishkhobragade/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="GitHub Profile: nitishkhobragade"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>

              <a
                href="https://www.instagram.com/nitish_khobragade"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white text-xs font-semibold rounded-lg transition-opacity shadow-2xs cursor-pointer"
                title="Instagram: @nitish_khobragade"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 text-pink-200" />
              </a>

              <a
                href="https://nitishkhobragade.github.io/portfolio.nitish/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Portfolio: Nitish Khobragade"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-indigo-200" />
              </a>

              <a
                href="https://wa.me/918982324497?text=Hello%20Admin%20Nitish%20Sir%2C%20I%20have%20contacted%20you%20from%20RGPV%20E%20Library%20Website%20Online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="WhatsApp"
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
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 leading-tight">Instant WhatsApp Support</p>
                <p className="text-[11px] text-emerald-700">Chat with Admin Er. Nitish Khobragade directly</p>
              </div>
            </div>

            <a
              href="https://wa.me/918982324497?text=Hello%20Admin%20Nitish%20Sir%2C%20I%20have%20contacted%20you%20from%20RGPV%20E%20Library%20Website%20Online"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact via WhatsApp</span>
            </a>
          </div>

          {/* Feedback & Subject Request Form */}
          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Message Delivered!</h4>
              <p className="text-xs text-emerald-700">
                Your message has been dispatched to <strong>djnitish97@gmail.com</strong>. Nitish Khobragade will review and respond to your email.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Send Query or Request Study Material
                </h4>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                  Live Free Mail Server
                </span>
              </div>

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
                  Your Email Address (For Reply)
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

              {submitError && (
                <div className="bg-amber-50 border border-amber-300/80 rounded-lg p-3 text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenMailto}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 transition-colors"
                    >
                      Open Email App
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Send via WhatsApp
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-400">
                  Sends directly to Nitish Khobragade
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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
                    <span>{loading ? 'Sending Mail...' : 'Send Message'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

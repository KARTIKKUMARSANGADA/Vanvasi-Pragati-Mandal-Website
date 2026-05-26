import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../api/axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []); 

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const generateCaptcha = useCallback(() => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ num1, num2 });
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const sanitize = (text) => {
    if (!text) return '';
    // Strip HTML tag markup to prevent script/injection payloads
    return text.replace(/<[^>]*>/g, '').trim();
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot spam-bot detector
    if (honeypot) {
      console.warn("Spam submission blocked.");
      setStatus('success'); // Tricking bot to believe it was successful
      showToast('success', "Your message has been sent successfully. We will get back to you shortly.");
      setFormData({ name: '', email: '', phone: '', message: '' });
      return;
    }

    // Mathematical CAPTCHA verification
    if (parseInt(captchaAnswer, 10) !== captcha.num1 + captcha.num2) {
      showToast('error', "Incorrect answer for the math question. Please try again.");
      return;
    }

    // Strict Input Sanitization
    const sanitizedData = {
      name: sanitize(formData.name),
      email: sanitize(formData.email),
      phone: sanitize(formData.phone),
      message: sanitize(formData.message)
    };

    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.phone || !sanitizedData.message) {
      showToast('error', "Please fill out all fields.");
      return;
    }

    try {
      await api.post('/contact/', sanitizedData);
      setStatus('success');
      showToast('success', "Your message has been sent successfully. We will get back to you shortly.");
      setFormData({ name: '', email: '', phone: '', message: '' });
      setCaptchaAnswer('');
      generateCaptcha();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to send message", error);
      setStatus('error');
      if (error.response?.status === 422) {
        const validationDetail = error.response.data.detail?.[0]?.msg || "Invalid format entered.";
        showToast('error', `Validation Error: ${validationDetail}`);
      } else {
        showToast('error', "Failed to send message. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="w-full pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white pt-28 pb-10 sm:pt-32 sm:pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get in touch with us to volunteer, support, or inquire about our ongoing projects.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Get In Touch</h2>
            <p className="text-slate-600 mb-10 leading-relaxed">
              Whether you want to partner with us, make a donation, or volunteer your time, we would love to hear from you. Reach out to us using the details below or fill out the contact form.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-green-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Our Office</h3>
                  <p className="text-slate-600">Vanvasi Pragati Mandal<br/>Pipaliya, Gujarat, India</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-green-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Phone</h3>
                  <p className="text-slate-600">+91 81402 55951</p>
                  <p className="text-sm text-slate-500 mt-1">Mon-Sat, 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-green-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Email</h3>
                  <p className="text-slate-600">official.vanvasipragatimandal@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-12 bg-slate-200 w-full h-64 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d229.62114159725408!2d74.10282508571534!3d22.952500582847048!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1777553701222!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="Office Location Map"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-bold mb-6 flex flex-col gap-1 shadow-sm"
              >
                <p className="text-base text-green-950 font-black">Thank you!</p>
                <p className="font-medium text-green-700">Your message has been sent successfully. We will get back to you shortly.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 transition-colors text-slate-800"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 transition-colors text-slate-800"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 transition-colors text-slate-800"
                  placeholder="+91 78747 89633"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-slate-50 transition-colors resize-none text-slate-800"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              {/* Mathematical CAPTCHA */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label htmlFor="captcha" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-primary" />
                  Spam Protection: What is {captcha.num1} + {captcha.num2}?
                </label>
                <input
                  type="number"
                  id="captcha"
                  name="captcha"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white transition-colors text-slate-800"
                  placeholder="Enter your answer"
                />
              </div>

              {/* Honeypot Input */}
              <div className="hidden" aria-hidden="true">
                <input 
                  type="text" 
                  name="website" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  tabIndex="-1" 
                  autoComplete="off" 
                />
              </div>

              {status === 'success' ? (
                <div className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-primary text-center">
                  ✅ Thank you! Your message has been received.
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer bg-secondary hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                >
                  <Send size={18} /> Send Message
                </button>
              )}
            </form>
          </motion.div>

        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white rounded-2xl shadow-2xl border p-4 flex gap-3.5 backdrop-blur-md overflow-hidden ${
              toast.type === 'success' 
                ? 'border-green-100 shadow-green-500/5' 
                : 'border-red-100 shadow-red-500/5'
            }`}
          >
            {/* Status indicator bar (Left border accent) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              toast.type === 'success' ? 'bg-primary' : 'bg-red-500'
            }`} />

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-green-50 text-primary' : 'bg-red-50 text-red-500'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {toast.type === 'success' ? 'Message Sent!' : 'Action Failed'}
              </h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 hover:bg-slate-50 rounded-lg h-fit"
            >
              <X size={16} />
            </button>

            {/* Auto-Dismiss Progress Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-1 ${
                toast.type === 'success' ? 'bg-primary/40' : 'bg-red-500/40'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Contact);

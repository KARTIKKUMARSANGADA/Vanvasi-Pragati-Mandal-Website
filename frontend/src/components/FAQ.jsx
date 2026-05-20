import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-5 sm:py-6 pr-10 sm:pr-0 flex items-center justify-between text-left group"
      >
        <span className={`text-sm sm:text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`${isOpen ? 'text-primary' : 'text-slate-400'}`}
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How can I volunteer for the trust?",
      answer: "We are always looking for passionate volunteers! You can reach out to us through the Contact page or visit our office in Pipaliya. We have opportunities in education, health camps, and administrative support."
    },
    {
      question: "Are my donations tax-deductible?",
      answer: "Yes, Vanvasi Pragati Mandal is a registered trust. Donations are eligible for tax exemptions under Section 80G of the Income Tax Act. We provide official receipts for all contributions."
    },
    {
      question: "Where do you primarily operate?",
      answer: "Our core operations are centered in the rural and tribal areas of Pipaliya and surrounding regions in Gujarat. We currently cover over 120 villages with various development projects."
    },
    {
      question: "How does the trust ensure transparency?",
      answer: "We maintain meticulous records of all projects and funds. Our annual reports and project audits are conducted regularly, and we work closely with government bodies to ensure full compliance and accountability."
    },
    {
      question: "Can I suggest a new project for my village?",
      answer: "Absolutely! We believe in community-driven development. If your village needs specific infrastructure or support, please contact our coordinator to discuss the feasibility and planning."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-wider uppercase mb-2">Got Questions?</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>
        
        <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-sm border border-slate-100">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

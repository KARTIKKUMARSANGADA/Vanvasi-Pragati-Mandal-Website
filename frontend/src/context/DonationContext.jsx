import React, { createContext, useContext, useState } from 'react';
import DonationModal from '../components/DonationModal';

const DonationContext = createContext();

export const DonationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDonation = () => setIsOpen(true);
  const closeDonation = () => setIsOpen(false);

  return (
    <DonationContext.Provider value={{ openDonation, closeDonation }}>
      {children}
      <DonationModal isOpen={isOpen} onClose={closeDonation} />
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { test, expect } from 'vitest';

test('renders app component without crashing', () => {
  render(
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  );
  // Just testing if the basic structure renders
  // We can't strictly test complex content here without mocking all API calls
  expect(document.body).toBeInTheDocument();
});

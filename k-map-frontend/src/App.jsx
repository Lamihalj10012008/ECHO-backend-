import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KMapApp from './components/KMapApp';
import './styles/variables.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 2 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KMapApp />
    </QueryClientProvider>
  );
}
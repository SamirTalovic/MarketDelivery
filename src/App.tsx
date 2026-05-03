import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import theme from './theme/theme';
import Index from './pages/Index';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import SyncComponent from './pages/SinkBKC';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/korpa" element={<Cart />} />
          <Route path="/adminhari" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/sync-bkc" element={<SyncComponent />} /> {/* Dodajemo rutu za SyncComponent */}
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </ThemeProvider>
);

export default App;

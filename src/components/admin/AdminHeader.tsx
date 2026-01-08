import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onOpenDeliverySettings: () => void;
  isAlerting?: boolean;
  onStopAlert?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  notificationsEnabled,
  onToggleNotifications,
  onOpenDeliverySettings,
  isAlerting = false,
  onStopAlert,
}) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #333333 100%)' }}>
      <Toolbar>
        <StorefrontIcon sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          HARI-M Admin Panel
        </Typography>
        
        {/* Alert dismiss button - shown when alerting */}
        {isAlerting && onStopAlert && (
          <Button
            variant="contained"
            color="error"
            onClick={onStopAlert}
            startIcon={<VolumeOffIcon />}
            sx={{
              mr: 2,
              animation: 'pulse 1s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.7, transform: 'scale(1.05)' },
                '100%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            NOVA PORUDŽBINA - Ugasi alarm
          </Button>
        )}
        
        <IconButton
          color="inherit"
          onClick={onToggleNotifications}
          sx={{ mr: 1 }}
          title={notificationsEnabled ? 'Isključi zvučna obaveštenja' : 'Uključi zvučna obaveštenja'}
        >
          {notificationsEnabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
        </IconButton>
        <IconButton
          color="inherit"
          onClick={onOpenDeliverySettings}
          sx={{ mr: 2 }}
          title="Podešavanja dostave"
        >
          <SettingsIcon />
        </IconButton>
        <Button color="inherit" onClick={() => navigate('/')}>
          Vidi prodavnicu
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;

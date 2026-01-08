import React  from 'react';
import { Snackbar, Alert, Slide, type SlideProps } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AddToCartNotificationProps {
  open: boolean;
  productName: string;
  quantity: number;
  onClose: () => void;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const AddToCartNotification: React.FC<AddToCartNotificationProps> = ({
  open,
  productName,
  quantity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        bottom: { xs: 80, sm: 100 }, // Above floating cart
      }}
    >
      <Alert
        icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
        severity="success"
        onClose={onClose}
        sx={{
          bgcolor: '#2E7D32',
          color: 'white',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          '& .MuiAlert-icon': {
            color: 'white',
          },
          '& .MuiAlert-action': {
            color: 'white',
          },
          animation: 'popIn 0.3s ease-out',
          '@keyframes popIn': {
            '0%': {
              transform: 'scale(0.8)',
              opacity: 0,
            },
            '50%': {
              transform: 'scale(1.05)',
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
        }}
      >
        {quantity}x {productName} dodato u korpu!
      </Alert>
    </Snackbar>
  );
};

export default AddToCartNotification;

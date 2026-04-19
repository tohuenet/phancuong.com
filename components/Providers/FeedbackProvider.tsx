'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Box, 
  alpha, 
  useTheme,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
}

interface FeedbackContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  // Confirm Dialog State
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        options: {
          title: 'Xác nhận hành động',
          confirmText: 'Xác nhận',
          cancelText: 'Hủy',
          severity: 'warning',
          ...options
        },
        resolve
      });
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(prev => prev ? { ...prev, open: false } : null);
    }
  };

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  }, []);

  return (
    <FeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      
      {/* Premium M3 Liquid Glass Confirm Dialog */}
      <AnimatePresence>
        {confirmState?.open && (
          <Dialog
            open={true}
            onClose={() => handleClose(false)}
            PaperComponent={({ children }) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                  type: 'spring', 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.3 
                }}
              >
                <Box
                  sx={{
                    borderRadius: '28px', // M3 Large Radius
                    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.8),
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.15)}`,
                    overflow: 'hidden',
                    maxWidth: 400,
                    width: 'calc(100vw - 48px)',
                    m: 3
                  }}
                >
                  {children}
                </Box>
              </motion.div>
            )}
            sx={{
              '& .MuiBackdrop-root': {
                bgcolor: alpha(theme.palette.common.black, 0.4),
                backdropFilter: 'blur(4px)',
              }
            }}
          >
            <Box sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                    display: 'flex'
                  }}
                >
                  <WarningAmberRoundedIcon />
                </Box>
                <DialogTitle sx={{ p: 0, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  {confirmState.options.title}
                </DialogTitle>
              </Stack>
              
              <DialogContent sx={{ p: 0, mb: 4 }}>
                <DialogContentText sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '1rem' }}>
                  {confirmState.options.message}
                </DialogContentText>
              </DialogContent>
              
              <DialogActions sx={{ p: 0, gap: 1.5 }}>
                <Button 
                  onClick={() => handleClose(false)} 
                  sx={{ 
                    borderRadius: '100px', 
                    textTransform: 'none', 
                    px: 3, 
                    fontWeight: 700,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                  }}
                >
                  {confirmState.options.cancelText}
                </Button>
                <Button 
                  onClick={() => handleClose(true)} 
                  variant="contained" 
                  color={confirmState.options.severity === 'error' ? 'error' : 'primary'}
                  autoFocus
                  sx={{ 
                    borderRadius: '100px', 
                    textTransform: 'none', 
                    px: 4, 
                    fontWeight: 700,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}` }
                  }}
                >
                  {confirmState.options.confirmText}
                </Button>
              </DialogActions>
            </Box>
          </Dialog>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

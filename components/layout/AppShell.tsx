'use client';

import * as React from 'react';
import { Box, Container, Typography, useTheme, alpha, IconButton, Tooltip, Stack } from '@mui/material';
import LiquidBackground from '../common/LiquidBackground';
import { tokens } from '@/lib/theme-tokens';
import { LayoutModeContext, ColorModeContext } from '../ThemeRegistry/ThemeContextProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { LogIn, Sun, Moon } from 'lucide-react';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { useFeedback } from '../Providers/FeedbackProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const { toggleColorMode } = React.useContext(ColorModeContext);
  const { isWide, toggleWideMode } = React.useContext(LayoutModeContext);
  const { data: session, status } = useSession();
  const { notify } = useFeedback();
  const prevStatus = React.useRef(status);
  const isAdminPath = pathname?.startsWith('/admin');

  // Track session changes for login/logout notifications
  React.useEffect(() => {
    const isLoginPending = sessionStorage.getItem('auth_welcome_pending') === 'true';
    const isLogoutPending = sessionStorage.getItem('auth_logout_pending') === 'true';

    if (status === 'authenticated' && session?.user && isLoginPending) {
      notify(`Chào mừng trở lại, ${session.user.name}!`, 'success');
      sessionStorage.removeItem('auth_welcome_pending');
    }

    if (status === 'unauthenticated' && isLogoutPending) {
      notify('Đã đăng xuất thành công. Hẹn gặp lại!', 'success');
      sessionStorage.removeItem('auth_logout_pending');
    }

    prevStatus.current = status;
  }, [status, session, notify]);

  const handleSignOut = async () => {
    notify('Đang đăng xuất...', 'info');
    sessionStorage.setItem('auth_logout_pending', 'true');
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleSignIn = () => {
    sessionStorage.setItem('auth_welcome_pending', 'true');
    notify('Đang chuyển hướng đến Google...', 'info');
    signIn('google');
  };

  if (isAdminPath) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <LiquidBackground />

      <Box 
        component="header" 
        sx={{ 
          pt: 8, 
          pb: 2, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Box 
            sx={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'baseline',
              cursor: 'pointer',
              '&:hover .logo-dot': {
                transform: 'scale(1.4)',
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`
              },
              '&:hover .logo-com': {
                opacity: 1,
                transform: 'translateY(0)',
              }
            }}
          >
            <Typography 
              component="span"
              sx={{ 
                fontWeight: 300, 
                letterSpacing: '0.02em',
                fontSize: '1.25rem',
                color: 'text.secondary',
                opacity: 0.8
              }}
            >
              PHAN
            </Typography>
            <Typography 
              component="span"
              sx={{ 
                fontWeight: 900, 
                letterSpacing: '0.02em',
                fontSize: '1.25rem',
                color: 'primary.main',
                ml: 0
              }}
            >
              CUONG
            </Typography>
            <Box 
              className="logo-dot"
              sx={{ 
                width: 4, 
                height: 4, 
                bgcolor: 'primary.main', 
                borderRadius: '50%',
                ml: 0.2,
                mr: 0.3,
                mb: 0.4,
                transition: 'all 0.3s ease',
                boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.3)}`
              }} 
            />
            <Typography 
              className="logo-com"
              component="span"
              sx={{ 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                color: 'text.primary',
                opacity: 0.4,
                transition: 'all 0.3s ease',
                transform: 'translateY(1px)'
              }}
            >
              COM
            </Typography>
          </Box>
        </Link>
      </Box>

      <Box 
        component="main" 
        id="main-content"
        sx={{ 
          flexGrow: 1, 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container 
          maxWidth={false}
          sx={{ 
            maxWidth: tokens.layout.contentWidth,
            width: '100%',
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 2, md: 4 },
            flexGrow: 1,
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Premium Floating Glass Dock Footer */}
      <Box 
        component="footer" 
        sx={{ 
          pb: 4, 
          pt: 2,
          mt: 'auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: tokens.curves.standard }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center', 
              gap: { xs: 2, sm: 4 },
              px: { xs: 3, sm: 4 }, 
              py: 1.5, 
              borderRadius: tokens.radius.xl,
              bgcolor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.4 : 0.6),
              backdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: (t) => `
                0 4px 20px ${alpha(t.palette.common.black, 0.08)},
                inset 0 0 0 1px ${alpha(t.palette.common.white, 0.05)}
              `,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
              }
            }}
          >
            {/* Copyright Section */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 600, 
                letterSpacing: '0.05em', 
                opacity: 0.6,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap'
              }}
            >
              © {new Date().getFullYear()} PHANCUONG.COM
            </Typography>

            {/* Credit Section - Horizontal now */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                position: 'relative',
                '&::before': {
                  content: { xs: 'none', sm: '""' },
                  position: 'absolute',
                  left: -16,
                  height: '12px',
                  width: '1px',
                  bgcolor: alpha(theme.palette.divider, 0.1)
                }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  fontFamily: tokens.typography.fontFamily.serif,
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  whiteSpace: 'nowrap'
                }}
              >
                Made with passion for perfection
              </Typography>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  filter: [
                    `drop-shadow(0 0 0px ${alpha(theme.palette.primary.main, 0)})`,
                    `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.6)})`,
                    `drop-shadow(0 0 0px ${alpha(theme.palette.primary.main, 0)})`
                  ]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <FavoriteRoundedIcon 
                  sx={{ 
                    fontSize: 16, 
                    color: 'primary.main', 
                    display: 'block',
                    filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none'
                  }} 
                />
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Global Floating Glass Toggle */}
      <Box
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 40 },
          top: { xs: 32, md: 40 },
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {/* Admin/User Buttons */}
        <AnimatePresence>
          {!session && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip title="Đăng nhập" placement="left">
                <IconButton
                  aria-label="Đăng nhập bằng Google"
                  onClick={handleSignIn}
                  sx={{
                    padding: '10px',
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                    backdropFilter: 'blur(12px) saturate(180%)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                    color: 'primary.main',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <LogIn size={20} />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}

          {session?.user && (
            <>
              {(session.user as any).isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip title="Bài viết mới" placement="left">
                    <IconButton
                      aria-label="Tạo bài viết mới"
                      component={Link}
                      href="/admin/posts/new"
                      sx={{
                        padding: '10px',
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                        backdropFilter: 'blur(12px) saturate(180%)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                        color: 'primary.main',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip title="Đăng xuất" placement="left">
                  <IconButton
                    aria-label="Đăng xuất"
                    onClick={handleSignOut}
                    sx={{
                      padding: '10px',
                      bgcolor: alpha(theme.palette.background.default, 0.4),
                      backdropFilter: 'blur(12px) saturate(180%)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                        color: 'primary.main',
                      },
                    }}
                  >
                    <LogoutIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Layout Toggle — hidden on mobile */}
        <Tooltip title={isWide ? 'Chế độ tập trung' : 'Chế độ mở rộng'} placement="left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              aria-label={isWide ? 'Chuyển sang chế độ tập trung' : 'Chuyển sang chế độ mở rộng'}
              onClick={toggleWideMode}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                padding: '10px',
                bgcolor: alpha(theme.palette.background.default, 0.4),
                backdropFilter: 'blur(12px) saturate(180%)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                color: 'text.secondary',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: 'primary.main',
                }
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isWide ? 'wide' : 'narrow'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 20,
                    height: 20,
                  }}
                >
                  {isWide ? (
                    <CloseFullscreenRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <OpenInFullRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </IconButton>
          </motion.div>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={theme.palette.mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'} placement="left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              aria-label={theme.palette.mode === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              onClick={(e) => toggleColorMode(e)}
              sx={{
                padding: '10px',
                bgcolor: alpha(theme.palette.background.default, 0.4),
                backdropFilter: 'blur(12px) saturate(180%)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                color: 'primary.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme.palette.mode}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex' }}
                >
                  {theme.palette.mode === 'dark' ? (
                    <Sun size={20} strokeWidth={2.5} />
                  ) : (
                    <Moon size={20} strokeWidth={2.5} />
                  )}
                </motion.div>
              </AnimatePresence>
            </IconButton>
          </motion.div>
        </Tooltip>
      </Box>
    </Box>
  );
}

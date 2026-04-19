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

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const { toggleColorMode } = React.useContext(ColorModeContext);
  const { isWide, toggleWideMode } = React.useContext(LayoutModeContext);
  const { data: session } = useSession();
  const isAdminPath = pathname?.startsWith('/admin');

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
                letterSpacing: '0.1em',
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
                letterSpacing: '0.05em',
                fontSize: '1.25rem',
                color: 'primary.main',
                ml: 0.5
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
                mx: 0.8,
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
                letterSpacing: '0.15em',
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

      {/* Premium Minimalist Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          mt: 'auto',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
          position: 'relative',
          zIndex: 1,
          bgcolor: alpha(theme.palette.background.default, 0.2),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: tokens.layout.contentWidth, px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.1em', opacity: 0.6 }}>
              © {new Date().getFullYear()} PHANCUONG.COM
            </Typography>
          </Box>
        </Container>
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
                  onClick={() => signIn('google')}
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
                    onClick={() => signOut()}
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

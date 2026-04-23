'use client';

import React, { useEffect, useCallback } from 'react';
import { Box, IconButton, Typography, alpha } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { m, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ images, currentIndex, open, onClose, onNavigate }: ImageLightboxProps) {

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, goNext, goPrev, onClose]);

  if (!open || images.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Backdrop */}
          <Box
            onClick={onClose}
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: alpha('#000', 0.92),
              backdropFilter: 'blur(20px)',
            }}
          />

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: { xs: 16, md: 32 },
              right: { xs: 16, md: 32 },
              zIndex: 10,
              color: '#fff',
              bgcolor: alpha('#fff', 0.08),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>

          {/* Counter */}
          <Typography
            sx={{
              position: 'absolute',
              top: { xs: 24, md: 40 },
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              color: alpha('#fff', 0.5),
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            {currentIndex + 1} / {images.length}
          </Typography>

          {/* Previous Button */}
          {currentIndex > 0 && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              sx={{
                position: 'absolute',
                left: { xs: 8, md: 32 },
                zIndex: 10,
                color: '#fff',
                bgcolor: alpha('#fff', 0.06),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#fff', 0.08)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.12),
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
          )}

          {/* Next Button */}
          {currentIndex < images.length - 1 && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              sx={{
                position: 'absolute',
                right: { xs: 8, md: 32 },
                zIndex: 10,
                color: '#fff',
                bgcolor: alpha('#fff', 0.06),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#fff', 0.08)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.12),
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ArrowForwardIosRoundedIcon />
            </IconButton>
          )}

          {/* Image Display */}
          <AnimatePresence mode="wait">
            <m.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'relative',
                zIndex: 5,
                maxWidth: '90vw',
                maxHeight: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Lightbox displays user-content images at full resolution; next/image's
                  optimizer would re-encode and lose fidelity, so we use a plain <img>. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  userSelect: 'none',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                }}
                draggable={false}
              />
            </m.div>
          </AnimatePresence>
        </m.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import EmojiPickerReact, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData, event: MouseEvent) => void;
  onClose: () => void;
  className?: string;
}

export default function EmojiPicker({
  onEmojiClick,
  onClose,
  className,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={pickerRef} className={className}>
      <EmojiPickerReact
        onEmojiClick={onEmojiClick}
        theme={Theme.DARK}
        lazyLoadEmojis={true}
        searchDisabled={false}
        skinTonesDisabled={true}
        previewConfig={{ showPreview: false }}
        width={300}
        height={350}
      />
    </div>
  );
}

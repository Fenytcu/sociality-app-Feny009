import { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker from '@/components/ui/EmojiPicker';
import { EmojiClickData } from 'emoji-picker-react';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  authorUsername?: string;
  // myAvatar is no longer needed in the new design
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  loading,
  authorUsername,
}: CommentInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(value + emojiData.emoji);
    // Don't close picker immediately for multiple emojis
  };

  return (
    <div className='relative w-full'>
      {showEmojiPicker && (
        <div className='absolute bottom-16 left-0 z-50'>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <form onSubmit={onSubmit} className='flex items-center gap-2 w-full'>
        <div className='flex-1 bg-neutral-900 rounded-full min-h-[44px] flex items-center px-2 py-1 border border-neutral-800 focus-within:border-neutral-700 transition-colors'>
          {/* Emoji Button */}
          <button
            type='button'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors ${
              showEmojiPicker
                ? 'text-yellow-400 bg-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Smile className='w-5 h-5' />
          </button>

          {/* Input Field */}
          <input
            type='text'
            placeholder={`Reply to ${authorUsername || 'author'}...`}
            className='flex-1 bg-transparent border-none text-white text-sm placeholder:text-neutral-500 focus:ring-0 py-2 px-2 focus:outline-none'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Post Button (Outside/Right) - as per screenshot implied layout or standard mobile pattern */}
        <button
          type='submit'
          disabled={loading || !value.trim()}
          className='px-4 py-2 bg-[#6936F2] hover:bg-[#5b2ed1] disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold text-sm rounded-full transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none min-w-[70px] flex justify-center'
        >
          {loading ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

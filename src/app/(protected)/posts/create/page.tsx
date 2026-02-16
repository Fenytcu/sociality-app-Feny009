'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { postService } from '@/services/post.service';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/user.service';

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; caption?: string }>(
    {}
  );

  // Draft Persistence: Load draft on mount
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const savedCaption = localStorage.getItem('post_draft_caption');
    const savedPreview = localStorage.getItem('post_draft_preview');

    if (savedCaption) setCaption(savedCaption);
    if (savedPreview) setImagePreview(savedPreview);
  }, [user, router]);

  // Draft Persistence: Save caption as user types
  useEffect(() => {
    if (caption) {
      localStorage.setItem('post_draft_caption', caption);
    } else {
      localStorage.removeItem('post_draft_caption');
    }
  }, [caption]);

  // Session Heartbeat: Keep session alive while editing
  useEffect(() => {
    const heartbeatInterval = setInterval(
      async () => {
        try {
          await userService.getMe();
          console.log('Heartbeat: Session kept alive');
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      },
      3 * 60 * 1000
    ); // Every 3 minutes

    return () => clearInterval(heartbeatInterval);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({
        ...errors,
        image: 'Please select an image file (PNG or JPG)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' });
      return;
    }

    // Clear image error
    setErrors({ ...errors, image: undefined });
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      localStorage.setItem('post_draft_preview', result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    localStorage.removeItem('post_draft_preview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate fields
    const newErrors: { image?: string; caption?: string } = {};

    if (!selectedImage) {
      newErrors.image = 'Please upload a photo';
    }

    if (!caption.trim()) {
      newErrors.caption = 'Please add a caption';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('content', caption);
      formData.append('caption', caption); // Also send as caption for compatibility

      await postService.createPost(formData);

      // Clear draft on success
      localStorage.removeItem('post_draft_caption');
      localStorage.removeItem('post_draft_preview');

      toast.success('Success Post');
      router.push('/feed');
    } catch (error) {
      console.error('Failed to create post:', error);
      let errorMessage = 'Failed to create post';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-black'>
      {/* Header - Desktop */}
      <div className='hidden md:block border-b border-neutral-900'>
        <div className='max-w-xl mx-auto px-6 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.back()}
              className='text-white hover:text-neutral-300 transition-colors'
            >
              <ArrowLeft className='w-6 h-6' />
            </button>
            <h1 className='text-xl font-bold text-white'>Add Post</h1>
          </div>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className='md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-900'>
        <button
          onClick={() => router.back()}
          className='text-white hover:text-neutral-300 transition-colors'
        >
          <ArrowLeft className='w-6 h-6' />
        </button>
        <h1 className='text-lg font-bold text-white'>Add Post</h1>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className='bg-purple-600 text-white font-semibold'>
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className='max-w-xl mx-auto px-4 md:px-6 py-6 md:py-8'>
        <div className='space-y-6'>
          {/* Photo Upload Section */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-white'>Photo</label>

            {!imagePreview ? (
              <>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 ${
                    errors.image
                      ? 'border-red-500 border-dashed'
                      : 'border-neutral-800'
                  } bg-[#1A1A1A] rounded-lg p-12 md:p-16 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-700 transition-colors group`}
                >
                  <Upload className='w-10 h-10 text-neutral-600 group-hover:text-neutral-500 transition-colors mb-4' />
                  <p className='text-sm text-center mb-1'>
                    <span className='text-[#6936F2] font-medium'>
                      Click to upload
                    </span>
                    <span className='text-neutral-400'> or drag and drop</span>
                  </p>
                  <p className='text-xs text-neutral-500'>
                    PNG or JPG (max. 5mb)
                  </p>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageSelect}
                    className='hidden'
                  />
                </div>
                {errors.image && (
                  <p className='text-sm text-red-500 mt-2'>{errors.image}</p>
                )}
              </>
            ) : (
              <div className='space-y-3'>
                <div className='relative rounded-lg overflow-hidden bg-neutral-900'>
                  <Image
                    src={imagePreview}
                    alt='Preview'
                    fill
                    className='w-full max-h-100 object-contain'
                  />
                </div>
                {/* Change and Delete buttons */}
                <div className='flex gap-3'>
                  <Button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='flex-1 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-medium h-10 rounded-lg'
                  >
                    <Upload className='w-4 h-4 mr-2' />
                    Change Image
                  </Button>
                  <Button
                    type='button'
                    onClick={handleRemoveImage}
                    variant='ghost'
                    className='text-red-500 hover:text-red-400 hover:bg-red-500/10 font-medium h-10'
                  >
                    <X className='w-4 h-4 mr-2' />
                    Delete Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-white'>Caption</label>
            <Textarea
              placeholder='Create your caption'
              value={caption}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCaption(e.target.value);
                // Clear caption error when user starts typing
                if (errors.caption) {
                  setErrors({ ...errors, caption: undefined });
                }
              }}
              className={`min-h-30 bg-[#1A1A1A] ${
                errors.caption ? 'border-red-500' : 'border-neutral-800'
              } text-white placeholder:text-neutral-600 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-purple-500 resize-none rounded-lg`}
              maxLength={2200}
            />
            {errors.caption && (
              <p className='text-sm text-red-500'>{errors.caption}</p>
            )}
          </div>

          {/* Share Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedImage || !caption.trim() || isSubmitting}
            className='w-full bg-[#6936F2] hover:bg-[#6941C6] text-white font-semibold h-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin mr-2' />
                Sharing...
              </>
            ) : (
              'Share'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

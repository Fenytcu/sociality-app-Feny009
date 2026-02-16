'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSelector } from '@/store/hooks';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lastUpdated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (bio !== undefined) formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedUser = await userService.updateProfile(formData);
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error('Failed to update profile from modal:', error);
      let errorMessage = 'Failed to update profile';
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
      <div className='bg-[#0A0D12] border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-neutral-800'>
          <h2 className='text-xl font-bold text-white'>Edit Profile</h2>
          <button
            onClick={onClose}
            className='text-neutral-400 hover:text-white transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Avatar Upload */}
          <div className='flex flex-col items-center'>
            <Avatar className='h-24 w-24 mb-4'>
              <AvatarImage
                src={
                  avatarPreview ||
                  (user.avatar
                    ? `${user.avatar}?t=${lastUpdated}`
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`)
                }
                alt={user.username}
              />
              <AvatarFallback className='bg-neutral-800 text-2xl'>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <label htmlFor='avatar-upload'>
              <div className='flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors'>
                <Upload className='w-4 h-4 text-white' />
                <span className='text-sm font-medium text-white'>
                  Change Photo
                </span>
              </div>
              <input
                id='avatar-upload'
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                className='hidden'
              />
            </label>
          </div>

          {/* Name */}
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-white font-bold text-sm'>
              Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Your name'
              className='bg-[#0A0D12] border-[#181D27] text-white placeholder:text-[#535862] h-11 rounded-lg focus-visible:ring-[#7F56D9] focus-visible:ring-offset-0 focus-visible:border-[#7F56D9]'
            />
          </div>

          {/* Bio */}
          <div className='space-y-2'>
            <Label htmlFor='bio' className='text-white font-bold text-sm'>
              Bio
            </Label>
            <textarea
              id='bio'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder='Tell us about yourself...'
              rows={4}
              maxLength={150}
              className='w-full bg-[#0A0D12] border border-[#181D27] text-white placeholder:text-[#535862] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7F56D9] focus:border-[#7F56D9] resize-none'
            />
            <p className='text-xs text-neutral-500 text-right'>
              {bio.length}/150
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-2'>
            <Button
              type='button'
              onClick={onClose}
              variant='outline'
              className='flex-1 border-neutral-700 text-white hover:bg-neutral-900'
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

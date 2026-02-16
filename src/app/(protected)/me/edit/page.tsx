'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { userService } from '@/services/user.service';
import { setUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, lastUpdated } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar size must be less than 2MB');
      return;
    }

    setSelectedAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (phone && phone.length < 10) {
      toast.error('Phone number too short');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      if (bio !== undefined) formData.append('bio', bio);
      if (phone !== undefined && phone.trim() !== '') {
        formData.append('phone', phone);
      }
      if (selectedAvatar) formData.append('avatar', selectedAvatar);

      const updatedUser = await userService.updateProfile(formData);
      dispatch(setUser(updatedUser)); // Updates Redux -> Updates Navbar

      toast.success('Profile Success Update');
      router.push(`/users/${updatedUser.username}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check for Axios-like error structure safely
      const _error = error as { response?: { data?: { message?: string } } };
      if (_error?.response?.data?.message) {
        errorMessage = _error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const { username, email } = user;

  const displayAvatar =
    avatarPreview ||
    (user.avatar
      ? `${user.avatar}?t=${lastUpdated}`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Sub Header */}
      <div className='max-w-xl mx-auto px-4 py-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.back()}
            className='text-white hover:text-neutral-300 transition-colors'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-2xl font-bold'>Edit Profile</h1>
        </div>
      </div>

      <div className='max-w-xl mx-auto px-4 py-8'>
        {/* Top Section: Avatar + Name/User/Email */}
        <div className='flex flex-row gap-6 mb-8 items-start'>
          {/* Avatar Section */}
          <div className='flex flex-col items-center gap-3 shrink-0'>
            <div className='relative'>
              <Avatar className='h-32.5 w-32.5 rounded-full border border-neutral-800 bg-[#1A1A1E]'>
                <AvatarImage
                  src={displayAvatar}
                  alt={user.username}
                  className='object-cover'
                />
                <AvatarFallback className='bg-neutral-800 text-white text-4xl font-bold uppercase'>
                  {user.name?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className='text-[#7F56D9] text-sm font-semibold hover:underline'
            >
              Change Photo
            </button>
            <p className='text-[10px] text-neutral-500'>130 x 130</p>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleAvatarSelect}
              className='hidden'
            />
          </div>

          {/* Top 3 Fields */}
          <div className='flex-1 space-y-4'>
            {/* Name */}
            <div className='space-y-1'>
              <label className='text-[10px] font-bold text-white uppercase tracking-wider opacity-60'>
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='bg-[#1A1A1E] border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-purple-500 text-white placeholder:text-neutral-600 h-11 rounded-lg px-3 text-sm'
                placeholder='John Doe'
              />
            </div>

            {/* Username */}
            <div className='space-y-1'>
              <label className='text-[10px] font-bold text-white uppercase tracking-wider opacity-60'>
                Username
              </label>
              <Input
                value={username}
                disabled
                className='bg-[#1A1A1E] border-neutral-800/80 text-neutral-500 h-11 rounded-lg px-3 text-sm cursor-not-allowed opacity-70'
              />
            </div>

            {/* Email */}
            <div className='space-y-1'>
              <label className='text-[10px] font-bold text-white uppercase tracking-wider opacity-60'>
                Email
              </label>
              <Input
                value={email}
                disabled
                className='bg-[#1A1A1E] border-neutral-800/80 text-neutral-500 h-11 rounded-lg px-3 text-sm cursor-not-allowed opacity-70'
              />
            </div>
          </div>
        </div>

        {/* Bottom Fields: Phone + Bio */}
        <div className='space-y-6'>
          {/* Number Phone */}
          <div className='space-y-2'>
            <label className='text-[10px] font-bold text-white uppercase tracking-wider opacity-60'>
              Number Phone
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='bg-[#1A1A1E] border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-purple-500 text-white placeholder:text-neutral-600 h-14 rounded-xl px-4'
              placeholder='081234567890'
            />
          </div>

          {/* Bio */}
          <div className='space-y-2'>
            <label className='text-[10px] font-bold text-white uppercase tracking-wider opacity-60'>
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='bg-[#1A1A1E] border-neutral-800/80 focus-visible:ring-1 focus-visible:ring-purple-500 text-white placeholder:text-neutral-600 min-h-30 rounded-xl resize-none p-4 px-4 text-sm leading-relaxed'
              placeholder='Creating unforgettable moments...'
            />
          </div>

          {/* Save Button */}
          <div className='pt-4 pb-12'>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='w-full bg-[#6936F2] hover:bg-[#5b2ed1] text-white font-bold h-14 rounded-xl shadow-xl shadow-purple-900/20 transition-all text-base'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin mr-2' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

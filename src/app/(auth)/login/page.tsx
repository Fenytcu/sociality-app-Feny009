'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/lib/validations/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import Image from 'next/image';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginValues) {
    try {
      const { user, token } = await authService.login(data);
      dispatch(setCredentials({ user, token }));
      toast.success('Login successful!');
      router.push('/feed');
    } catch (error) {
      console.error(error);
      const errorMessage = (error as any)?.response?.data?.message || (error instanceof Error ? error.message : 'Failed to login');
      toast.error(errorMessage);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(120% 80% at 50% 100%, #6D28D9 0%, #000000 100%)',
          opacity: 0.8
        }}
      />
      
      <Card className="relative w-full max-w-[345px] md:max-w-[446px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl text-white shadow-2xl pt-8 pb-8 px-6 md:pt-10 md:pb-10 md:px-6 z-10 transition-all duration-300">
        <CardHeader className="p-0 space-y-4 md:space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-[30px] h-[30px]">
              <Image 
                src="/assets/Logo.png" 
                alt="Sociality Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[24px] font-bold tracking-tight">Sociality</span> 
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-[24px] font-bold text-center tracking-tight">Welcome Back!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4 md:mt-6 flex flex-col gap-4 md:gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-bold text-[14px]">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        {...field} 
                        className="text-[16px] font-medium bg-[#0A0D12] border-[#181D27] text-white placeholder:text-[#535862] h-11 rounded-lg focus-visible:ring-[#7F56D9] focus-visible:ring-offset-0 focus-visible:border-[#7F56D9]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-bold text-[14px]">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Enter your password" 
                          {...field} 
                          className="text-[16px] font-medium bg-[#0A0D12] border-[#181D27] text-white placeholder:text-[#535862] h-11 rounded-lg focus-visible:ring-[#7F56D9] focus-visible:ring-offset-0 focus-visible:border-[#7F56D9] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                          <div className="relative w-5 h-5">
                             <Image 
                                src="/assets/eye.png" 
                                alt="Toggle password" 
                                fill
                                className="object-contain opacity-70 hover:opacity-100"
                             />
                          </div>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-[#6936F2] hover:bg-[#6941C6] text-white font-semibold h-11 rounded-[100px] mt-2 transition-all" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="text-center text-[16px] font-semibold text-[#FDFDFD]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#7F51F9] text-[16px] font-bold hover:text-[#6941C6] transition-colors">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

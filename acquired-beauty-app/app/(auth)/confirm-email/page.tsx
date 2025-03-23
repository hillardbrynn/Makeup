'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import supabase from '@/lib/supabase';

export default function ConfirmEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Input refs for OTP fields
  const inputRefs = Array(6).fill(0).map(() => useState(null)[0]);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('verificationEmail');
    if (!storedEmail) {
      // No email found, redirect to signup
      router.push('/signup');
      return;
    }
    setEmail(storedEmail);
    
    // Focus first input on load
    if (inputRefs[0]) {
      inputRefs[0].focus();
    }
  }, [router]);

  // Handle OTP input changes
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character
    setOtp(newOtp);
    
    // Auto-advance to next input
    if (value && index < 5 && inputRefs[index + 1]) {
      inputRefs[index + 1].focus();
    }
  };

  // Handle key presses for backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1]) {
      // Move to previous input on backspace if current input is empty
      inputRefs[index - 1].focus();
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus last input after paste
      if (inputRefs[5]) {
        inputRefs[5].focus();
      }
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otpString = otp.join('');
    
    // Check if OTP is complete
    if (otpString.length !== 6) {
      toast.error("Incomplete OTP", {
        description: "Please enter the complete 6-digit code"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: 'signup'
      });
      
      if (error) throw error;
      
      // OTP verified successfully
      toast.success("Email verified!", {
        description: "Your account has been successfully verified."
      });
      
      // Clear verification email from localStorage
      localStorage.removeItem('verificationEmail');
      
      // Redirect to quiz
      router.push('/quiz');
      
    } catch (error) {
      toast.error("Verification failed", {
        description: error.message || "Invalid or expired code. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setLoading(true);
    
    try {
      // Request new OTP from Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast.success("Code resent", {
        description: "A new verification code has been sent to your email."
      });
      
      // Disable resend button for 60 seconds
      setResendDisabled(true);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to resend code", {
        description: error.message || "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50 to-neutral-50 flex items-center justify-center p-6">
      {/* Sonner Toaster */}
      <Toaster position="top-center" richColors />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-pink-100 rounded-br-[40%] opacity-40" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-rose-100 rounded-tl-[40%] opacity-30" />
      
      <Card className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Header accent */}
        <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-500"></div>
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Verify your email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a verification code to<br />
            <span className="font-medium">{email || 'your email'}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => inputRefs[index] = el}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-semibold rounded-lg border-gray-300 focus:ring-2 focus:ring-rose-300 focus:border-rose-500"
                />
              ))}
            </div>
            
            <p className="mt-4 text-sm text-center text-gray-600">
              Enter the 6-digit code sent to your email
            </p>
          </div>
          
          <Button
            onClick={verifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-col items-center">
          <div className="text-sm text-gray-600">
            <span>Didn't receive a code? </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={resendOtp}
                    disabled={loading || resendDisabled}
                    variant="link"
                    className="text-rose-500 hover:text-rose-600 font-medium p-0 h-auto"
                  >
                    {resendDisabled ? `Resend in ${countdown}s` : 'Resend'}
                  </Button>
                </TooltipTrigger>
                {resendDisabled && (
                  <TooltipContent>
                    <p>Please wait before requesting a new code</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button
            onClick={() => router.push('/signup')}
            variant="ghost"
            className="mt-4 text-gray-500"
          >
            Back to Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
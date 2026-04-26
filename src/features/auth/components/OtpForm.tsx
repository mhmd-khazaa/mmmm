'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button, PinCode } from 'rizzui';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import { requestPasswordReset, verifyResetToken } from '@/lib/auth';

type FormValues = { otp: string };

export default function OtpForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const { handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: { otp: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsVerifying(true);
      if (!email) throw new Error('Email is missing. Restart the reset password flow.');

      await verifyResetToken({ email, token: data.otp });
      toast.success('OTP verified successfully.');
      router.push(
        `${routes.auth.forgotPassword}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.otp)}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to verify OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      if (!email) throw new Error('Email is missing. Restart the reset password flow.');
      await requestPasswordReset(email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-5 lg:space-y-8">
        <PinCode
          variant="outline"
          setValue={(value) => setValue('otp', String(value))}
          className="pb-2"
          size="lg"
        />
        <Button
          className="w-full text-base font-medium"
          type="button"
          size="xl"
          variant="outline"
          rounded="lg"
          onClick={handleResend}
          isLoading={isResending}
          disabled={isVerifying || isResending}
        >
          Resend OTP
        </Button>
        <Button
          className="w-full text-base font-medium"
          type="submit"
          size="xl"
          rounded="lg"
          isLoading={isVerifying}
          disabled={isVerifying || isResending}
        >
          Verify OTP
        </Button>
      </div>
    </form>
  );
}

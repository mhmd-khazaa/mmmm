'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PinCode, Button } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler } from 'react-hook-form';
import { routes } from '@/config/routes';
import {
  requestPasswordReset,
  verifyResetToken,
} from '@/lib/auth/auth-client';

type FormValues = {
  otp: string;
};

export default function OtpForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsVerifying(true);

      if (!email) {
        throw new Error('Email is missing. Restart the reset password flow.');
      }

      await verifyResetToken({ email, token: data.otp });
      toast.success('OTP verified successfully.');
      router.push(
        `${routes.auth.forgotPassword4}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.otp)}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to verify OTP.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);

      if (!email) {
        throw new Error('Email is missing. Restart the reset password flow.');
      }

      await requestPasswordReset({ email });
      toast.success('A new OTP has been sent.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to resend OTP.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form<FormValues> onSubmit={onSubmit} useFormProps={{ defaultValues: { otp: '' } }}>
      {({ setValue }) => (
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
      )}
    </Form>
  );
}

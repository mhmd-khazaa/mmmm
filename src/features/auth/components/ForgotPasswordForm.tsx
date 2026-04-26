'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Password, Text } from 'rizzui';
import { useMedia } from '@/hooks/use-media';
import { routes } from '@/config/routes';
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from '@/lib/auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/features/auth/validation/schemas';

function RequestResetForm({
  initialEmail,
  isMedium,
}: {
  initialEmail: string;
  isMedium: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    try {
      setIsSubmitting(true);
      await requestPasswordReset(data.email);
    } catch {
      // Toast already shown by the API interceptor.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Input
          type="email"
          size={isMedium ? 'lg' : 'xl'}
          label="Email"
          placeholder="Enter your email"
          className="[&>label>span]:font-medium"
          {...register('email')}
          error={errors.email?.message}
        />
        <Button
          className="w-full"
          type="submit"
          size={isMedium ? 'lg' : 'xl'}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Send Reset Link
        </Button>
      </div>
    </form>
  );
}

function ResetPasswordView({
  email,
  token,
  isMedium,
}: {
  email: string;
  token: string;
  isMedium: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    mode: 'onChange',
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, password: '', confirmPassword: '' },
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    try {
      setIsSubmitting(true);
      await resetPassword({
        email: data.email,
        token,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      router.push(routes.auth.signIn);
    } catch {
      // Toast already shown by the API interceptor.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Input
          type="email"
          size={isMedium ? 'lg' : 'xl'}
          label="Email"
          placeholder="Enter your email"
          className="[&>label>span]:font-medium"
          {...register('email')}
          error={errors.email?.message}
        />
        <Password
          label="New Password"
          placeholder="Enter your new password"
          size={isMedium ? 'lg' : 'xl'}
          className="[&>label>span]:font-medium"
          {...register('password')}
          error={errors.password?.message}
        />
        <Password
          label="Confirm Password"
          placeholder="Confirm your new password"
          size={isMedium ? 'lg' : 'xl'}
          className="[&>label>span]:font-medium"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button
          className="w-full"
          type="submit"
          size={isMedium ? 'lg' : 'xl'}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Save New Password
        </Button>
      </div>
    </form>
  );
}

export default function ForgotPasswordForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const initialEmail = searchParams.get('email') ?? '';
  const isResetMode = Boolean(token);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!isResetMode) return;

    if (!initialEmail) {
      setTokenError('Reset link is invalid. Missing email.');
      return;
    }

    let mounted = true;
    setIsVerifying(true);
    setTokenError(null);
    verifyResetToken({ email: initialEmail, token })
      .then(() => mounted && setIsTokenValid(true))
      .catch((err: unknown) => {
        if (!mounted) return;
        setIsTokenValid(false);
        setTokenError(
          err instanceof Error ? err.message : 'The reset link is invalid or expired.'
        );
      })
      .finally(() => mounted && setIsVerifying(false));

    return () => {
      mounted = false;
    };
  }, [initialEmail, isResetMode, token]);

  const renderContent = () => {
    if (!isResetMode) {
      return <RequestResetForm initialEmail={initialEmail} isMedium={isMedium} />;
    }
    if (isVerifying) {
      return (
        <div className="space-y-4 text-center">
          <Text className="text-sm leading-6 text-gray-500">
            Verifying your reset link...
          </Text>
          <Button
            className="w-full"
            type="button"
            size={isMedium ? 'lg' : 'xl'}
            isLoading
            disabled
          >
            Verifying
          </Button>
        </div>
      );
    }
    if (isTokenValid) {
      return <ResetPasswordView email={initialEmail} token={token} isMedium={isMedium} />;
    }
    return (
      <div className="space-y-4 text-center">
        <Text className="text-sm leading-6 text-red-600">
          {tokenError ?? 'The reset link is invalid or expired.'}
        </Text>
        <Button
          className="w-full"
          type="button"
          size={isMedium ? 'lg' : 'xl'}
          onClick={() => router.push(routes.auth.forgotPassword)}
        >
          Request a New Link
        </Button>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        Don’t want to reset?{' '}
        <Link
          href={routes.auth.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-primary"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}

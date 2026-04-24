'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmitHandler } from 'react-hook-form';
import { Button, Input, Password, Text } from 'rizzui';
import { useMedia } from '@core/hooks/use-media';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from '@/lib/auth/auth-client';
import {
  forgetPasswordSchema,
  ForgetPasswordSchema,
} from '@/validators/forget-password.schema';
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from '@/validators/reset-password.schema';

const initialValues = {
  email: '',
};

function extractForgotPasswordMessage(payload: unknown) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const directMessage = (payload as { message?: unknown }).message;

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  const nestedData = (payload as { data?: unknown }).data;

  if (!nestedData || typeof nestedData !== 'object' || Array.isArray(nestedData)) {
    return null;
  }

  const nestedMessage = (nestedData as { message?: unknown }).message;

  if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
    return nestedMessage;
  }

  return null;
}

export default function ForgetPasswordForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [reset, setReset] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const initialEmail = searchParams.get('email') ?? '';
  const isResetMode = Boolean(token);

  useEffect(() => {
    if (!isResetMode) {
      setIsTokenValid(false);
      setTokenError(null);
      return;
    }

    if (!initialEmail) {
      setIsTokenValid(false);
      setTokenError('Reset link is invalid. Missing email.');
      return;
    }

    let isMounted = true;

    const validateToken = async () => {
      try {
        setIsVerifyingToken(true);
        setTokenError(null);
        await verifyResetToken({ email: initialEmail, token });

        if (!isMounted) {
          return;
        }

        setIsTokenValid(true);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setIsTokenValid(false);
        setTokenError(
          error instanceof Error
            ? error.message
            : 'The reset link is invalid or expired.'
        );
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
      }
    };

    void validateToken();

    return () => {
      isMounted = false;
    };
  }, [initialEmail, isResetMode, token]);

  const onRequestReset: SubmitHandler<ForgetPasswordSchema> = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await requestPasswordReset({ email: data.email });
      const successMessage =
        extractForgotPasswordMessage(response) ??
        'If an account exists for this email, a password reset link has been sent.';

      toast.success(successMessage);
      setReset(initialValues);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to send reset link.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitResetPassword: SubmitHandler<ResetPasswordSchema> = async (data) => {
    try {
      setIsSubmitting(true);

      await resetPassword({
        email: data.email,
        token,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      toast.success('Password reset successfully. Please sign in.');
      router.push(routes.auth.signIn4);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to reset password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isResetMode ? (
        isVerifyingToken ? (
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
        ) : isTokenValid ? (
          <Form<ResetPasswordSchema>
            validationSchema={resetPasswordSchema}
            onSubmit={onSubmitResetPassword}
            useFormProps={{
              mode: 'onChange',
              defaultValues: {
                email: initialEmail,
                password: '',
                confirmPassword: '',
              },
            }}
          >
            {({ register, formState: { errors } }) => (
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
            )}
          </Form>
        ) : (
          <div className="space-y-4 text-center">
            <Text className="text-sm leading-6 text-red-600">
              {tokenError ?? 'The reset link is invalid or expired.'}
            </Text>
            <Button
              className="w-full"
              type="button"
              size={isMedium ? 'lg' : 'xl'}
              onClick={() => router.push(routes.auth.forgotPassword4)}
            >
              Request a New Link
            </Button>
          </div>
        )
      ) : (
        <Form<ForgetPasswordSchema>
          validationSchema={forgetPasswordSchema}
          resetValues={reset}
          onSubmit={onRequestReset}
          useFormProps={{
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors } }) => (
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
          )}
        </Form>
      )}
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        Don’t want to reset?{' '}
        <Link
          href={routes.auth.signIn4}
          className="font-semibold text-gray-700 transition-colors hover:text-primary"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}

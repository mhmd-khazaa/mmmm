'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Input, Password, Text } from 'rizzui';
import toast from 'react-hot-toast';
import { useMedia } from '@/hooks/use-media';
import { routes } from '@/config/routes';
import { login, lookupTenantBaseUrl } from '@/lib/auth';
import {
  lookupLoginSchema,
  loginSchema,
  type LoginSchema,
} from '@/features/auth/validation/schemas';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function SignInForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantBaseUrl, setTenantBaseUrl] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const isPasswordStep = Boolean(tenantBaseUrl);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm<LoginSchema>({
    mode: 'onChange',
    defaultValues: initialValues,
    resolver: zodResolver(isPasswordStep ? loginSchema : lookupLoginSchema),
  });

  const emailValue = watch('email');

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    try {
      setIsSubmitting(true);

      if (!isPasswordStep) {
        const baseUrl = await lookupTenantBaseUrl(data.email);
        setTenantBaseUrl(baseUrl);
        setResolvedEmail(data.email);
        setValue('email', data.email, { shouldValidate: true });
        clearErrors('password');
        toast.success('Email verified. Enter your password to continue.');
        return;
      }

      if (!data.password) {
        setError('password', { type: 'required', message: 'Password is required' });
        return;
      }

      await login({
        email: resolvedEmail ?? data.email,
        password: data.password,
        tenantBaseUrl: tenantBaseUrl ?? undefined,
      });
      router.push(routes.dashboard);
    } catch {
      // Toast already shown by the API interceptor.
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isPasswordStep || !resolvedEmail || emailValue === resolvedEmail) return;
    setTenantBaseUrl(null);
    setResolvedEmail(null);
    resetField('password');
    clearErrors('password');
  }, [clearErrors, emailValue, isPasswordStep, resetField, resolvedEmail]);

  const forgotPasswordHref = resolvedEmail
    ? `${routes.auth.forgotPassword}?email=${encodeURIComponent(resolvedEmail)}`
    : routes.auth.forgotPassword;

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5 lg:space-y-6">
          <Input
            type="email"
            size={isMedium ? 'lg' : 'xl'}
            label="Email"
            placeholder="Enter your email"
            className="[&>label>span]:font-medium"
            readOnly={isPasswordStep}
            {...register('email')}
            error={errors.email?.message}
          />

          {isPasswordStep && (
            <>
              <Text className="text-sm leading-6 text-gray-500">
                Your account was found. Enter your password to continue.
              </Text>
              <Password
                label="Password"
                placeholder="Enter your password"
                size={isMedium ? 'lg' : 'xl'}
                className="[&>label>span]:font-medium"
                {...register('password')}
                error={errors.password?.message}
              />
            </>
          )}

          <div className="flex items-center justify-between pb-1">
            <Checkbox
              {...register('rememberMe')}
              label="Remember Me"
              className="[&>label>span]:font-medium"
            />
            {isPasswordStep && (
              <Link
                href={forgotPasswordHref}
                className="h-auto p-0 text-sm font-semibold text-gray-700 underline transition-colors hover:text-primary hover:no-underline"
              >
                Forgot Password?
              </Link>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            size={isMedium ? 'lg' : 'xl'}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isPasswordStep ? 'Sign In' : 'Continue'}
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        Don’t have an account?{' '}
        <Link
          href={routes.auth.signUp}
          className="font-semibold text-gray-700 transition-colors hover:text-primary"
        >
          Sign Up
        </Link>
      </Text>
    </>
  );
}

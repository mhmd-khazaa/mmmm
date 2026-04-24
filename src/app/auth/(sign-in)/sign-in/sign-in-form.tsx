'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Password, Checkbox, Button, Input, Text } from 'rizzui';
import { useMedia } from '@core/hooks/use-media';
import { routes } from '@/config/routes';
import { loginUser, lookupTenantBaseUrl } from '@/lib/auth/auth-client';
import { lookupLoginSchema, loginSchema, LoginSchema } from '@/validators/login.schema';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};


export default function SignInForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedTenantBaseUrl, setResolvedTenantBaseUrl] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const isPasswordStep = !!resolvedTenantBaseUrl;
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
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
        const tenantBaseUrl = await lookupTenantBaseUrl(data.email);

        setResolvedTenantBaseUrl(tenantBaseUrl);
        setResolvedEmail(data.email);
        clearErrors('password');
        toast.success('Email verified. Enter your password to continue.');
        return;
      }

      if (!data.password) {
        setError('password', {
          type: 'required',
          message: 'Password is required',
        });
        return;
      }

      await loginUser({
        email: data.email,
        password: data.password,
        tenantBaseUrl: resolvedTenantBaseUrl,
      });
      toast.success('Signed in successfully.');
      router.push(routes.file.manager);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to sign in right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isPasswordStep || !resolvedEmail || emailValue === resolvedEmail) {
      return;
    }

    setResolvedTenantBaseUrl(null);
    setResolvedEmail(null);
    resetField('password');
    clearErrors('password');
  }, [clearErrors, emailValue, isPasswordStep, resetField, resolvedEmail]);

  const emailField = register('email');
  const passwordField = register('password');

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
            {...emailField}
            error={errors.email?.message}
          />

          {isPasswordStep ? (
            <>
              <Text className="text-sm leading-6 text-gray-500">
                Your account was found. Enter your password to continue.
              </Text>
              <Password
                label="Password"
                placeholder="Enter your password"
                size={isMedium ? 'lg' : 'xl'}
                className="[&>label>span]:font-medium"
                {...passwordField}
                error={errors.password?.message}
              />
            </>
          ) : null}

          <div className="flex items-center justify-between pb-1">
            <Checkbox
              {...register('rememberMe')}
              label="Remember Me"
              className="[&>label>span]:font-medium"
            />
            {isPasswordStep ? (
              <Link
                href={routes.auth.forgotPassword4}
                className="h-auto p-0 text-sm font-semibold text-gray-700 underline transition-colors hover:text-primary hover:no-underline"
              >
                Forgot Password?
              </Link>
            ) : null}
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
          href={routes.auth.signUp4}
          className="font-semibold text-gray-700 transition-colors hover:text-primary"
        >
          Sign Up
        </Link>
      </Text>
    </>
  );
}

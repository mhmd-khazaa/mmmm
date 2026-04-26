'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Input, Password, Text } from 'rizzui';
import toast from 'react-hot-toast';
import { useMedia } from '@/hooks/use-media';
import { routes } from '@/config/routes';
import {
  signUpSchema,
  type SignUpSchema,
} from '@/features/auth/validation/schemas';

export default function SignUpForm() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', isAgreed: false },
  });

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to create account.');

      toast.success(result.message ?? 'Account created successfully.');
      router.push(routes.auth.signIn);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong while signing up.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {...register('email')}
            error={errors.email?.message}
          />
          <Password
            label="Password"
            placeholder="Enter your password"
            size={isMedium ? 'lg' : 'xl'}
            className="[&>label>span]:font-medium"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="col-span-2 flex items-start text-gray-700">
            <Checkbox
              {...register('isAgreed')}
              className="[&>label.items-center]:items-start [&>label>div.leading-none]:mt-0.5 [&>label>div.leading-none]:sm:mt-0 [&>label>span]:font-medium"
              label={
                <Text as="span" className="ps-1 text-gray-500">
                  By signing up you agree to our Terms &amp; Privacy Policy.
                </Text>
              }
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            size={isMedium ? 'lg' : 'xl'}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Account
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        Already have an account?{' '}
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

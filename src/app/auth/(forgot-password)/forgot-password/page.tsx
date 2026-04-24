import { Suspense } from 'react';
import AuthWrapper from '@/app/shared/auth-layout/auth-wrapper';
import ForgetPasswordForm from './forgot-password-form';

export default function ForgotPassword() {
  return (
    <AuthWrapper
      title={
        <>
          Having trouble to sign in? <br className="hidden sm:inline-block" />{' '}
          Reset your password.
        </>
      }
    >
      <Suspense fallback={null}>
        <ForgetPasswordForm />
      </Suspense>
    </AuthWrapper>
  );
}

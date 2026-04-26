import { Suspense } from 'react';
import { metaObject } from '@/config/site.config';
import AuthWrapper from '@/features/auth/components/AuthWrapper';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export const metadata = metaObject('Forgot Password');

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </Suspense>
    </AuthWrapper>
  );
}

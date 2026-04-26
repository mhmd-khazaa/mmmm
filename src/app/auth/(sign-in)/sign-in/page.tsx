import { metaObject } from '@/config/site.config';
import AuthWrapper from '@/features/auth/components/AuthWrapper';
import SignInForm from '@/features/auth/components/SignInForm';

export const metadata = metaObject('Sign In');

export default function SignInPage() {
  return (
    <AuthWrapper
      title={
        <>
          Welcome Back! <br /> Sign in with your credentials.
        </>
      }
      isSignIn
      isSocialLoginActive
    >
      <SignInForm />
    </AuthWrapper>
  );
}

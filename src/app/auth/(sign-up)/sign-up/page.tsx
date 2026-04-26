import { metaObject } from '@/config/site.config';
import AuthWrapper from '@/features/auth/components/AuthWrapper';
import SignUpForm from '@/features/auth/components/SignUpForm';

export const metadata = metaObject('Sign Up');

export default function SignUpPage() {
  return (
    <AuthWrapper
      title="Join us today! Get special benefits and stay up-to-date."
      isSocialLoginActive
    >
      <SignUpForm />
    </AuthWrapper>
  );
}

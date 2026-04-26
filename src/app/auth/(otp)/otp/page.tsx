import { Suspense } from 'react';
import { Text } from 'rizzui/typography';
import { metaObject } from '@/config/site.config';
import AuthWrapper from '@/features/auth/components/AuthWrapper';
import OtpForm from '@/features/auth/components/OtpForm';

export const metadata = metaObject('OTP Verification');

export default function OtpPage() {
  return (
    <AuthWrapper title="OTP Verification" className="md:px-14 lg:px-20">
      <Text className="pb-7 text-center text-[15px] leading-[1.85] text-gray-700 md:text-base md:!leading-loose lg:-mt-5">
        Enter the OTP sent to your email.
      </Text>
      <Suspense fallback={null}>
        <OtpForm />
      </Suspense>
    </AuthWrapper>
  );
}

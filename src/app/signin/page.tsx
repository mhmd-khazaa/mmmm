import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  redirect(routes.auth.signIn4);
}

import { FC } from 'react';
import { LogInForm } from '../components/LogInForm'
import MainLayout from '../components/MainLayout';

export const LogInPage: FC<object> = () => {
  return (
    <MainLayout>
      <LogInForm />
    </MainLayout>
  )
};
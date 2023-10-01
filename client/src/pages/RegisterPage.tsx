import { FC } from 'react';
import { RegisterForm } from '../components/RegisterForm';
import MainLayout from '../components/MainLayout';
import ExpressAPI from '../api/express-api';

interface RegisterPageProps {
  expressApi: ExpressAPI;
}

export const RegisterPage: FC<RegisterPageProps> = ({ expressApi }) => {
  return (
    <MainLayout>
      <RegisterForm expressApi={ expressApi } /> 
    </MainLayout>
  )
};
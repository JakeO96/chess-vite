import { FC } from 'react';
import { RegisterForm } from '../components/RegisterForm';
import ExpressAPI from '../api/express-api';

interface RegisterPageProps {
  expressApi: ExpressAPI;
}

export const RegisterPage: FC<RegisterPageProps> = ({ expressApi }) => {
  return (
    <RegisterForm expressApi={ expressApi } /> 
  )
};
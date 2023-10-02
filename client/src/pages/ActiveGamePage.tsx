import { FC } from 'react';
import { ActiveGame } from '../components/ActiveGame';
import MainLayout from '../components/MainLayout';

export const ActiveGamePage: FC<object> = () => {
  return (
    <MainLayout>
      <ActiveGame />
    </MainLayout>
  )
};
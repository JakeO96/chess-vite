import { FC } from 'react';
import { ActiveGame } from '../components/ActiveGame';
import MainLayout from '../components/MainLayout';

export const ActiveGamePage: FC<{}> = () => {
  return (
    <MainLayout>
      <ActiveGame />
    </MainLayout>
  )
};
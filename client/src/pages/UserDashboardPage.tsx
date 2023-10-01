import { FC, useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import ExpressAPI from "../api/express-api";
import { StartGamePortal } from "../components/StartGamePortal";

interface DashboardPageProps {
  expressApi: ExpressAPI
}

export const DashboardPage: FC<DashboardPageProps> = ({ expressApi }) => {

  return (
    <MainLayout>
      <header>
        <h1>
          DASHBOARD
        </h1>
      </header>
      <StartGamePortal expressApi={expressApi} />
    </MainLayout>
  );
}
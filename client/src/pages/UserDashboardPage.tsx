import { FC } from "react";
import ExpressAPI from "../api/express-api";
import { StartGamePortal } from "../components/StartGamePortal";

interface DashboardPageProps {
  expressApi: ExpressAPI
}


export const DashboardPage: FC<DashboardPageProps> = ({ expressApi }) => {

  return (
    <>
      <header>
        <div className="flex justify-center mt-4 mb-10">
          <h1 className="text-noct-white mx-auto">
            Dashboard
          </h1>
        </div>
      </header>
      <StartGamePortal expressApi={expressApi} />
    </>
  );
}
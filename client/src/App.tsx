import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';

import { LogInPage } from './pages/LogInPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/UserDashboardPage';
import { ActiveGamePage } from './pages/ActiveGamePage';
import { NewUserRedirectToLogin } from './pages/NewUserRedirectVerifyEmail';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MainHeader } from './components/MainHeader';
import { ErrorPage } from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import ExpressAPI from './api/express-api';

const expressApi: ExpressAPI = new ExpressAPI();

const router = createBrowserRouter([
  {
    path: "/", 
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      {path: '/', Component: HomePage},
      {path: "login", Component: LogInPage},
      {path: "register", element: <RegisterPage expressApi={expressApi} />},
      {path: "new-user-redirect-to-login", Component: NewUserRedirectToLogin},
      {
        path: "dashboard", 
        element: (
          <ProtectedRoute>
            <DashboardPage expressApi={expressApi} />
          </ProtectedRoute>) 
      },
      {
        path: "game/:gameId",
        element: (
          <ProtectedRoute>
            <ActiveGamePage />
          </ProtectedRoute>
        )
      }
    ] 
  },
])

function Root() {
  return (
    <div className="max-w-[1920px] mx-auto bg-noct-black min-h-screen">
      <MainHeader />
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <AuthProvider expressApi={expressApi}>
      <DndProvider backend={HTML5Backend}>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </DndProvider>
    </AuthProvider>
  );
}

export default App;
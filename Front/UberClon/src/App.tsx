import { useAppStore } from './store/useAppStore';
import { Login } from './components/auth/Login';
import { PassengerHome } from './components/passenger/PassengerHome';
import { DriverHome } from './components/driver/DriverHome';
import { LandingPage } from './components/common/LandingPage';

function App() {
  const { user, isAuthenticated, showLogin } = useAppStore();

  // Si se debe mostrar el login
  if (showLogin) {
    return <Login />;
  }

  // Si el usuario está autenticado, mostrar su aplicación correspondiente
  if (isAuthenticated && user) {
    return (
      <div className="App">
        {user.userType === 'passenger' ? <PassengerHome /> : <DriverHome />}
      </div>
    );
  }

  // Por defecto, mostrar la página de inicio
  return <LandingPage />;
}

export default App;

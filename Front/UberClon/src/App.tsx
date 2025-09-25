import { useAppStore } from './store/useAppStore';
import { Login } from './components/auth/Login';
import { PassengerHome } from './components/passenger/PassengerHome';
import { DriverHome } from './components/driver/DriverHome';
import { DriverTestPage } from './components/driver/DriverTestPage';
import { RouteTest } from './components/common/RouteTest';
import { LocationTest } from './components/common/LocationTest';
import LocationDiagnostic from './components/common/LocationDiagnostic';
import { LandingPage } from './components/common/LandingPage';

function App() {
  const { user, isAuthenticated, showLogin } = useAppStore();

  // Verificar si estamos en modo de prueba de conductor
  const isDriverTest = window.location.pathname === '/driver-test' || window.location.search.includes('driver-test');
  
  // Verificar si estamos en modo de prueba de rutas
  const isRouteTest = window.location.pathname === '/route-test' || window.location.search.includes('route-test');
  
  // Verificar si estamos en modo de prueba de ubicación
  const isLocationTest = window.location.pathname === '/location-test' || window.location.search.includes('location-test');
  
  // Verificar si estamos en modo de diagnóstico de ubicación
  const isLocationDiagnostic = window.location.pathname === '/location-diagnostic' || window.location.search.includes('location-diagnostic');

  // Modo de prueba para conductores
  if (isDriverTest) {
    return <DriverTestPage />;
  }

  // Modo de prueba para rutas
  if (isRouteTest) {
    return <RouteTest />;
  }

  // Modo de prueba para ubicación
  if (isLocationTest) {
    return <LocationTest />;
  }

  // Modo de diagnóstico de ubicación
  if (isLocationDiagnostic) {
    return <LocationDiagnostic />;
  }

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

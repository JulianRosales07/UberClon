import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Login } from './components/auth/Login';
import { PassengerHome } from './components/passenger/PassengerHome';
import { DriverHome } from './components/driver/DriverHome';

function App() {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  return (
    <div className="App">
      {user.userType === 'passenger' ? <PassengerHome /> : <DriverHome />}
    </div>
  );
}

export default App;

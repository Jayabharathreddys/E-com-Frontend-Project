import { useContext } from 'react';
// Import AuthContext directly from its own file, not from AuthProvider.
// AuthProvider's default export is also AuthContext but that coupling is non-obvious.
import AuthContext from './AuthContext';

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;

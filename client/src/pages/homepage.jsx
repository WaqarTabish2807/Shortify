// src/pages/HomePage.js
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome</h1>
      <button onClick={() => navigate('/auth')}>
       Get started
      </button>
    </div>
  );
}

export default HomePage;

import './Login.css';
import React from 'react';
import { auth, provider, signInWithPopup } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;
      const uname = user.displayName;
      const accessToken = await user.getIdToken();
      localStorage.setItem('uid', uid);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('uname', uname);

      navigate('/home', { state: { uid, accessToken ,uname } });
      window.location.href = '/home';
    } catch (error) {
      console.error(error);
    }
    
  };

  return (
    <div className="form-container">
    <div className="form-box">
      <div className="app-info">
        <h1 className="app-title">Track your <span className='p'>P</span><span>&</span><span className='l'>L</span> </h1>
        <p className="app-description">
            We help you keep track of your Profit & Loss from each trade whilst also helping you monitor your overall portfolio.
        </p>
      </div>
      <div className="form-content">
       
        <h1 className="form-title"></h1>
        <button onClick={handleLogin} className="form-button">
          <img
            src="http://www.androidpolice.com/wp-content/themes/ap2/ap_resize/ap_resize.php?src=http%3A%2F%2Fwww.androidpolice.com%2Fwp-content%2Fuploads%2F2015%2F10%2Fnexus2cee_Search-Thumb-150x150.png&w=150&h=150&zc=3"
            alt="Google icon"
            className="google-icon"
          />

          Sign in with Google
        </button>
      </div>

    </div>
  </div>
  );
}

export default Login;

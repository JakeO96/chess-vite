import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';

export const NewUserRedirectToLogin: React.FC<{}> = () => {
  const [counter, setCounter] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return(
    <>
      <div className="center">
        <h3>Your account was successfully created</h3>
        <h3>We have sent you an email, please click on the link in the email to activate your account.</h3>
      </div>
      <div>
        <p>You will be redirected to the log in page in {counter} ...</p>
        <p> Or <Link to="/login">go to the log in page now</Link></p>
      </div>
      
      { (counter < 1) ? (
          <Navigate to="/login" />
         ) : null }
    </>
  )
};
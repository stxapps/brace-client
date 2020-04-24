import React from 'react';
import logo from '../images/logo-short.svg';

const Loading = () => {
  return (
    <div className="relatvie w-screen h-screen">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 square-spin">
        <img className="" src={logo} alt="Loading..." />
      </div>
    </div>
  )
};

export default Loading;

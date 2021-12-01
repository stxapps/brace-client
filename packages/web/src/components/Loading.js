import React from 'react';
import logo from '../images/logo-short.svg';

const Loading = () => {
  return (
    <div className="relative w-screen h-screen">
      <div style={{ top: '33.3333%' }} className="absolute left-1/2 flex justify-center items-center w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 square-spin">
        <img src={logo} alt="" />
      </div>
    </div>
  )
};

export default Loading;

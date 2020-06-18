import React from 'react';

class Back extends React.Component {

  render() {
    return (
      <div className="pt-32">
        <div className="text-base text-gray-900 text-center">[This Page intentionally Left Blank]</div>
        <a className="pt-12 pb-2 block text-base text-gray-900 text-center" href="/">
          Go to <span className="underline">your links</span>
        </a>
        <div className="text-base text-gray-900 text-center">or</div>
        <div className="pt-2 text-base text-gray-900 text-center">Press back to close</div>
      </div>
    )
  }
}

export default Back;

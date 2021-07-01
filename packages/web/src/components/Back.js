import React from 'react';

class Back extends React.PureComponent {

  render() {
    return (
      <div className="pt-32">
        <div className="text-base text-gray-500 text-center">[This Page intentionally Left Blank]</div>
        <a className="pt-12 pb-2 block text-base text-gray-500 text-center" href="/">
          Go to <span className="text-gray-900 font-medium underline rounded-sm focus:outline-none focus:ring">your links</span>
        </a>
        <div className="text-base text-gray-500 text-center">or</div>
        <div className="pt-2 text-base text-gray-500 text-center">Press back to close</div>
      </div>
    )
  }
}

export default Back;

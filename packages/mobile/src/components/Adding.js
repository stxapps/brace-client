import React from 'react';
import { connect } from 'react-redux';

import { InterText as Text } from '.';

class Adding extends React.PureComponent {

  render() {

    return (
      <Text>This is an adding.</Text>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    href: state.window.href,
  };
};

export default connect(mapStateToProps)(Adding);

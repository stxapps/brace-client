import React from 'react';
import { connect } from 'react-redux';

import { signOut, addLink, updateSearchString } from '../actions';

class BottomBar extends React.Component {

  render() {
    return (
      <React.Fragment>
        <div>This is a bottom bar!</div>
      </React.Fragment>
    );
  }
}

export default connect(null, { signOut, addLink, updateSearchString })(BottomBar);

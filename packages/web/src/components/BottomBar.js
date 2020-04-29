import React from 'react';
import { connect } from 'react-redux';

import { addLink, searchLinks, signOut } from '../actions';

class BottomBar extends React.Component {

  render() {
    return (
      <React.Fragment>
        <div>This is a bottom bar!</div>
      </React.Fragment>
    );
  }
}

export default connect(null, { addLink, searchLinks, signOut })(BottomBar);

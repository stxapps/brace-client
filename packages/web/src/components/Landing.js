import React from 'react';
import { connect } from 'react-redux';

import { signIn, signUp } from '../actions';

class Landing extends React.Component {

  render() {
    return (
      <React.Fragment>
        <div>
          <button onClick={ () => this.props.signIn() }>Sign in</button>
        </div>
        <div>Landing page</div>
        <div>
          <button onClick={ () => this.props.signUp() }>Get started</button>
        </div>
        <div>
          <a href="https://blockstack.org">Learn blockstack more</a>
        </div>
        <div>
          <a href="#about">About</a>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = null;

export default connect(mapStateToProps, { signIn, signUp })(Landing);

import React from 'react';
import { connect } from 'react-redux';

import { updateHistoryPosition, signOut, updatePopup } from '../actions';
import { BACK_DECIDER, BACK_POPUP } from '../types/const';

class Main extends React.Component {

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, null, window.location.href);
      window.history.pushState(BACK_POPUP, null, window.location.href);
    }
  }

  render() {
    return (
      <React.Fragment>
        <div><h1>Main page</h1></div>
        <button onClick={() => this.props.signOut()}>Sign out</button>
        <div><p>This is a main page.</p></div>
        <div><p>Link1</p></div>
        <div><p>Link2</p></div>
        <button onClick={() => this.props.updatePopup(!this.props.isPopupShown)}>Toggle popup</button>
        <div><p>Now popup shown is {String(this.props.isPopupShown)}</p></div>
      </React.Fragment>
    );
  }

  componentWillUnmount() {
    console.log("Main component will unmount")
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isPopupShown: state.display.isPopupShown,
  }
};

export default connect(mapStateToProps, { updateHistoryPosition, signOut, updatePopup })(Main);

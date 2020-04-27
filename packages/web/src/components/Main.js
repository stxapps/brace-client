import React from 'react';
import { connect } from 'react-redux';

import { updateHistoryPosition, signOut, updatePopup } from '../actions';
import { BACK_DECIDER, BACK_POPUP } from '../types/const';
import { getVisibleLinks } from '../selectors';

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
        <div className="p-3"><h1 className="font-bold">Main page</h1></div>
        <button onClick={() => this.props.signOut()}>Sign out</button>
        <div className="p-3"></div>
        <div><p>This is a main page.</p></div>
        <div><p>Card Link1</p></div>
        <div><p>Card Link2</p></div>
        <button onClick={() => this.props.updatePopup(!this.props.isPopupShown)}>Toggle popup</button>
        <div><p>Now popup shown is {String(this.props.isPopupShown)}</p></div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    isPopupShown: state.display.isPopupShown,
    links: getVisibleLinks(state, props),
  }
};

export default connect(mapStateToProps, { updateHistoryPosition, signOut, updatePopup })(Main);

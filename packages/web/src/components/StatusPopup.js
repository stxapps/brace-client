import React from 'react';
import { connect } from 'react-redux';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
} from '../types/actionTypes';
import { updateStatus } from '../actions';

const MSGS = {
  [FETCH]: 'Fetching data from Gaia...',
  [FETCH_COMMIT]: 'Finished fetching data.',
  [FETCH_ROLLBACK]: 'Error fetching data!',
  [DELETE_OLD_LINKS_IN_TRASH]: 'Deleting old links in trash...',
  [DELETE_OLD_LINKS_IN_TRASH_COMMIT]: 'Finished deleting old links.',
  [DELETE_OLD_LINKS_IN_TRASH_ROLLBACK]: 'Error deleting old links!',
};

class StatusPopup extends React.Component {

  state = { isReady: false };
  msg = '';
  timeout = null;

  componentDidMount() {
    this.setState({ isReady: true });
  }

  onTimeout = () => {
    this.props.updateStatus(null);
  }

  render() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    let translate = 'translate-x-full';
    if (this.state.isReady) {
      let { status } = this.props;
      if (status) {
        this.msg = MSGS[status];
        translate = '';

        if ([FETCH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_COMMIT].includes(status)) {
          this.timeout = setTimeout(this.onTimeout, 1000);
        }
      }
    }

    return (
      <div style={{ top: '64px' }} className="absolute right-0 w-56 h-12 text-right overflow-hidden">
        <span className={`inline-block transform ${translate} transition duration-300 ease-in-out`}>{this.msg}</span>
      </div >
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    status: state.display.status,
  }
};

const mapDispatchToProps = {
  updateStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(StatusPopup);

import React from 'react';
import { connect } from 'react-redux';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
} from '../types/actionTypes';
import { MD_WIDTH } from '../types/const';
import { updateStatus } from '../actions';
import { toPx } from '../utils';

const MSGS = {
  [FETCH]: 'Fetching data from server...',
  [FETCH_COMMIT]: 'Finished fetching data.',
  [FETCH_ROLLBACK]: 'Error fetching data!',
  [EXTRACT_CONTENTS]: 'Beautifying your links...',
  [EXTRACT_CONTENTS_COMMIT]: 'Finished beautifying your links.',
  [EXTRACT_CONTENTS_ROLLBACK]: 'Error beautifying your links!',
  [DELETE_OLD_LINKS_IN_TRASH]: 'Deleting old links in trash...',
  [DELETE_OLD_LINKS_IN_TRASH_COMMIT]: 'Finished deleting old links.',
  [DELETE_OLD_LINKS_IN_TRASH_ROLLBACK]: 'Error deleting old links!',
};

const MSGS_SHRT = {
  [FETCH]: 'Fetching data...',
  [FETCH_COMMIT]: 'Finished fetching.',
  [FETCH_ROLLBACK]: 'Error fetching!',
  [EXTRACT_CONTENTS]: 'Beautifying...',
  [EXTRACT_CONTENTS_COMMIT]: 'Finished beautifying.',
  [EXTRACT_CONTENTS_ROLLBACK]: 'Error beautifying!',
  [DELETE_OLD_LINKS_IN_TRASH]: 'Deleting old links...',
  [DELETE_OLD_LINKS_IN_TRASH_COMMIT]: 'Finished deleting.',
  [DELETE_OLD_LINKS_IN_TRASH_ROLLBACK]: 'Error deleting!',
};

const DISTANCE_Y = 36;

class StatusPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { isReady: false };
    this.msg = '';
    this.msgShrt = '';
    this.timeout = null;
  }

  componentDidMount() {
    this.setState({ isReady: true });
  }

  onTimeout = () => {
    this.props.updateStatus(null);
  }

  render() {

    const { offsetY } = this.props;

    if (this.timeout) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    let translate = 'translate-x-full';
    if (this.state.isReady) {
      const { status } = this.props;
      if (status) {
        this.msg = MSGS[status];
        this.msgShrt = MSGS_SHRT[status];
        translate = '';

        if ([
          FETCH_COMMIT,
          DELETE_OLD_LINKS_IN_TRASH_COMMIT,
          EXTRACT_CONTENTS_COMMIT,
        ].includes(status)) {
          this.timeout = window.setTimeout(this.onTimeout, 1000);
        }
      }
    }

    const initialTop = window.innerWidth < MD_WIDTH ? '4.6rem' : '5.095rem';
    const top = Math.max(0, toPx(initialTop) - offsetY);
    const right = 0;
    const opacity = Math.max(0, 1.0 - (offsetY / DISTANCE_Y));
    const visibility = offsetY >= DISTANCE_Y ? 'hidden' : 'visible';
    const style = { top, right, opacity, visibility };

    const transition = window.pageYOffset <= 100 ? 'transition-transform duration-300 ease-in-out' : '';

    return (
      /** @ts-ignore */
      <div style={style} className="absolute w-48 text-right overflow-hidden sm:w-64">
        <span className={`pl-3 hidden bg-white text-gray-700 rounded-l-full transform ${translate} ${transition} sm:inline-block`}>{this.msg}</span>
        <span className={`pl-3 inline-block bg-white text-gray-700 rounded-l-full transform ${translate} ${transition} sm:hidden`}>{this.msgShrt}</span>
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

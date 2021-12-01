import React from 'react';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
} from '../types/actionTypes';
import { SM_WIDTH } from '../types/const';
import { updateStatus } from '../actions';
import { statusPopupFMV } from '../types/animConfigs';

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
  [UPDATE_SETTINGS]: 'Updating settings...',
  [UPDATE_SETTINGS_COMMIT]: 'Finished updating settings.',
  [UPDATE_SETTINGS_ROLLBACK]: 'Error updating settings!',
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
  [UPDATE_SETTINGS]: 'Updating settings...',
  [UPDATE_SETTINGS_COMMIT]: 'Finished updating.',
  [UPDATE_SETTINGS_ROLLBACK]: 'Error updating!',
};

class StatusPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.msg = '';
    this.timeout = null;
  }

  onTimeout = () => {
    this.props.updateStatus(null);
  }

  render() {
    const { status } = this.props;

    if (this.timeout) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    let animate = 'hidden';
    if (status) {
      this.msg = window.innerWidth < SM_WIDTH ? MSGS_SHRT[status] : MSGS[status];
      animate = 'visible';

      if ([
        FETCH_COMMIT,
        DELETE_OLD_LINKS_IN_TRASH_COMMIT,
        EXTRACT_CONTENTS_COMMIT,
        UPDATE_SETTINGS_COMMIT,
      ].includes(status)) {
        this.timeout = window.setTimeout(this.onTimeout, 1000);
      }
    }
    if (window.pageYOffset > 100) animate += 'NoAnim';

    return (
      <div className="w-48 text-right overflow-hidden sm:w-64">
        <motion.span className="pl-3 inline-block bg-white text-sm text-gray-500 tracking-wide rounded-l-full" variants={statusPopupFMV} initial={false} animate={animate}>{this.msg}</motion.span>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    status: state.display.status,
  };
};

const mapDispatchToProps = { updateStatus };

export default connect(mapStateToProps, mapDispatchToProps)(StatusPopup);

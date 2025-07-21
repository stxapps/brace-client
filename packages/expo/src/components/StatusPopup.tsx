import React from 'react';
import { View, Text, Animated } from 'react-native';
import { connect } from 'react-redux';

import { updateStatus } from '../actions/chunk';
import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK, DELETE_OLD_LINKS_IN_TRASH,
  DELETE_OLD_LINKS_IN_TRASH_COMMIT, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
  UPDATE_SETTINGS, UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK,
} from '../types/actionTypes';
import { SM_WIDTH } from '../types/const';
import { getStatus, getThemeMode } from '../selectors';
import { statusPopupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

const AnimatedText = Animated.createAnimatedComponent(Text);

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
  [EXTRACT_CONTENTS_COMMIT]: 'Finished beautify...',
  [EXTRACT_CONTENTS_ROLLBACK]: 'Error beautifying!',
  [DELETE_OLD_LINKS_IN_TRASH]: 'Deleting old links...',
  [DELETE_OLD_LINKS_IN_TRASH_COMMIT]: 'Finished deleting.',
  [DELETE_OLD_LINKS_IN_TRASH_ROLLBACK]: 'Error deleting!',
  [UPDATE_SETTINGS]: 'Updating settings...',
  [UPDATE_SETTINGS_COMMIT]: 'Finished updating.',
  [UPDATE_SETTINGS_ROLLBACK]: 'Error updating!',
};

class StatusPopup extends React.PureComponent<any, any> {

  msg: string;
  timeout: any;
  doClearTimeout: boolean;
  textWidth: number;
  translateX: Animated.Value;
  animation: any;
  prevProps: any;

  constructor(props) {
    super(props);

    this.msg = '';
    this.timeout = null;
    this.doClearTimeout = true;

    this.textWidth = 0;
    this.translateX = new Animated.Value(0);
    this.animation = null;

    this.prevProps = { ...props, status: null };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.doClearTimeout = this.props.status !== nextProps.status;
    this.prevProps = { ...this.props };
  }

  onTextLayout = (e) => {
    const textWidth = e.nativeEvent.layout.width;

    if (!this.prevProps.status && this.props.status) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.timing(
        this.translateX, { toValue: -1 * textWidth, ...statusPopupFMV.visible }
      );
      this.animation.start();
    }

    if (this.prevProps.status && !this.props.status) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.timing(
        this.translateX, { toValue: 0, ...statusPopupFMV.hidden }
      );
      this.animation.start();
    }

    if (this.prevProps.status && this.props.status && this.textWidth !== textWidth) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.timing(
        this.translateX, { toValue: -1 * textWidth, ...statusPopupFMV.visible }
      );
      this.animation.start();
    }

    this.textWidth = textWidth;
  };

  onTimeout = () => {
    this.props.updateStatus(null);
  };

  render() {
    const { status, safeAreaWidth, tailwind } = this.props;

    // Clear timeout only when status changed, not when only safeAreaWidth changed.
    if (this.timeout && this.doClearTimeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (status) {
      this.msg = safeAreaWidth < SM_WIDTH ? MSGS_SHRT[status] : MSGS[status];

      if ([
        FETCH_COMMIT,
        DELETE_OLD_LINKS_IN_TRASH_COMMIT,
        EXTRACT_CONTENTS_COMMIT,
        UPDATE_SETTINGS_COMMIT,
      ].includes(status)) {
        this.timeout = setTimeout(this.onTimeout, 1000);
      }
    } else {
      // HACK here to force calling onTextlayout
      this.msg = this.msg + ' ';
    }

    const textStyle = {
      transform: [{ translateX: this.translateX }],
    };

    return (
      <View style={tailwind('w-36 flex-row items-center justify-start overflow-hidden sm:w-64')}>
        <View style={tailwind('h-full w-full')} />
        <AnimatedText onLayout={this.onTextLayout} style={[tailwind('rounded-l-full bg-white text-sm font-normal tracking-wide text-gray-500 blk:bg-gray-900 blk:text-gray-400'), textStyle]}>{this.msg}</AnimatedText>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    status: getStatus(state),
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updateStatus };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(StatusPopup));

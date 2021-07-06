import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Animated } from 'react-native';

import {
  FETCH, FETCH_COMMIT, FETCH_ROLLBACK,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK,
  EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT, EXTRACT_CONTENTS_ROLLBACK,
} from '../types/actionTypes';
import { SM_WIDTH } from '../types/const';
import { updateStatus } from '../actions';
import { tailwind } from '../stylesheets/tailwind';
import { statusPopupAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';

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

class StatusPopup extends React.PureComponent {

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
      this.animation = Animated.spring(
        this.translateX, { toValue: -1 * textWidth, ...statusPopupAnimConfig.visible }
      );
      this.animation.start();
    }

    if (this.prevProps.status && !this.props.status) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.spring(
        this.translateX, { toValue: 0, ...statusPopupAnimConfig.hidden }
      );
      this.animation.start();
    }

    if (this.prevProps.status && this.props.status && this.textWidth !== textWidth) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.spring(
        this.translateX, { toValue: -1 * textWidth, ...statusPopupAnimConfig.visible }
      );
      this.animation.start();
    }

    this.textWidth = textWidth;
  }

  onTimeout = () => {
    this.props.updateStatus(null);
  }

  render() {
    const { status, safeAreaWidth } = this.props;

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
      <View style={tailwind('w-48 flex-row justify-start items-center overflow-hidden sm:w-64', safeAreaWidth)}>
        <View style={tailwind('w-full h-full')} />
        <AnimatedText onLayout={this.onTextLayout} style={[tailwind('pl-3 bg-white text-sm text-gray-500 font-normal tracking-wide rounded-l-full'), textStyle]}>{this.msg}</AnimatedText>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    status: state.display.status,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { updateStatus };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(StatusPopup));

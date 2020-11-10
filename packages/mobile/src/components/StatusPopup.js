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

    this.doShow = false;
    this.isShowing = false;
    this.textWidth = 0;
    this.translateX = new Animated.Value(0);
  }

  componentDidMount() {
    if (this.props.status !== null) this.doShow = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.status === null && nextProps.status !== null) {
      this.doShow = true;
    }
    if (this.props.status !== null && nextProps.status === null) {
      this.doShow = false;
    }
  }

  onTextLayout = (e) => {
    const textWidth = e.nativeEvent.layout.width;

    const mDuration = 300;
    const cDuration = 100;

    if (this.doShow && !this.isShowing) {
      Animated.timing(this.translateX, {
        toValue: -1 * textWidth,
        duration: mDuration,
        useNativeDriver: true,
      }).start(() => {
        this.isShowing = true;
      });
    }
    if (!this.doShow && this.isShowing) {
      Animated.timing(this.translateX, {
        toValue: 0,
        duration: mDuration,
        useNativeDriver: true,
      }).start(() => {
        this.isShowing = false;
      });
    }
    if (this.doShow && this.isShowing && this.textWidth !== textWidth) {
      Animated.timing(this.translateX, {
        toValue: -1 * textWidth,
        duration: cDuration,
        useNativeDriver: true,
      }).start();
    }

    this.textWidth = textWidth;
  }

  onTimeout = () => {
    this.props.updateStatus(null);
  }

  render() {

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const { status, safeAreaWidth } = this.props;
    if (status) {
      this.msg = safeAreaWidth >= SM_WIDTH ? MSGS[status] : MSGS_SHRT[status];

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

    if (!styles.text) {
      const textStyle = {
        transform: [{ translateX: this.translateX }],
      };
      styles.text = [tailwind('pl-3 bg-white text-base text-gray-900 font-normal leading-6 rounded-l-full'), textStyle];
    }

    return (
      <View style={tailwind('w-48 flex-row justify-start items-center overflow-hidden sm:w-64', safeAreaWidth)}>
        <View style={tailwind('w-full h-full')}></View>
        <AnimatedText onLayout={this.onTextLayout} style={styles.text}>{this.msg}</AnimatedText>
      </View>
    );
  }
}

const styles = {};

const mapStateToProps = (state, props) => {
  return {
    status: state.display.status,
    windowWidth: state.window.width,
  }
};

const mapDispatchToProps = {
  updateStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(StatusPopup));

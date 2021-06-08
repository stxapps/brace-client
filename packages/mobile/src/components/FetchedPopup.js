import React from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { updateFetched } from '../actions';
import { MD_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';
import { popupOpenAnimConfig, popupCloseAnimConfig } from '../types/animConfigs';

import { withSafeAreaContext } from '.';

class FetchedPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { didCloseAnimEnd: !props.fetched, isShown: true };

    this.popupTranslateY = new Animated.Value(this.getMinusTopPlus(props));
    this.animation = null;
  }

  componentDidMount() {
    if (this.props.fetched) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.spring(
        this.popupTranslateY, { toValue: 0, ...popupOpenAnimConfig }
      );
      this.animation.start();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { fetched } = this.props;
    const { isShown } = this.state;

    if (!prevProps.fetched && fetched) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.spring(
        this.popupTranslateY, { toValue: 0, ...popupOpenAnimConfig }
      );
      this.animation.start();
    }

    if ((prevProps.fetched && !fetched) || (prevState.isShown && !isShown)) {
      if (this.animation) this.animation.stop();
      this.animation = Animated.spring(
        this.popupTranslateY,
        { toValue: this.getMinusTopPlus(this.props), ...popupCloseAnimConfig }
      );
      this.animation.start(() => {
        this.setState({ didCloseAnimEnd: true });
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.isShown) {
      if (!this.props.fetched && nextProps.fetched) {
        if (this.state.didCloseAnimEnd) {
          this.setState({ didCloseAnimEnd: false });
        }
      }
    }
  }

  getTop(props) {
    const { safeAreaWidth, insets } = this.props;

    const initialTop = safeAreaWidth < MD_WIDTH ? 74 : 82;
    return initialTop + insets.top;
  }

  getMinusTopPlus(props) {
    return -1 * (this.getTop(props) + 80);
  }

  onUpdateBtnClick = () => {
    this.props.updateFetched(null, null, null, true);
  }

  onCloseBtnClick = () => {
    this.setState({ isShown: false });
  }

  render() {

    const { fetched, safeAreaWidth } = this.props;
    const { isShown, didCloseAnimEnd } = this.state;
    if ((!fetched && didCloseAnimEnd) || (!isShown && didCloseAnimEnd)) return null;

    // width is 163 from onLayout
    const style = {
      top: this.getTop(this.props),
      left: (safeAreaWidth - 163) / 2,
      transform: [{ translateY: this.popupTranslateY }],
    };
    const updateBtnStyle = {
      paddingTop: 4,
      paddingRight: 0,
      paddingBottom: 5,
      paddingLeft: 12,
    };
    const closeBtnStyle = { marginRight: 8 };

    return (
      <Animated.View style={[tailwind('absolute flex-row items-center bg-blue-500 rounded-full shadow-lg z-30'), style]}>
        <TouchableOpacity onPress={this.onUpdateBtnClick} style={cache('FP_updateBtn', updateBtnStyle)}>
          <Text style={tailwind('text-sm text-white font-normal')}>There is an update</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onCloseBtnClick} style={cache('FP_cancelBtn', [tailwind('ml-1 flex-shrink-0 flex-row items-center justify-center h-4 w-4 rounded-full'), closeBtnStyle])}>
          <Svg style={tailwind('text-base text-blue-100 font-normal')} width={8} height={8} viewBox="0 0 8 8" stroke="currentColor" fill="none">
            <Path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </Svg>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;

  return {
    fetched: state.fetched[listName],
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { updateFetched };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(FetchedPopup));

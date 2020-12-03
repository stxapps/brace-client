import React from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { updateFetched } from '../actions';
import { MD_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

import { withSafeAreaContext } from '.';

class FetchedPopup extends React.PureComponent {

  constructor(props) {
    super(props);

    this.initialState = { isShown: true };
    this.state = { ...this.initialState };
  }

  onUpdateBtnClick = () => {
    this.props.updateFetched(null, null, null, true);
  }

  onCloseBtnClick = () => {
    this.setState({ isShown: false });
  }

  render() {

    const { fetched, safeAreaWidth } = this.props;
    const { isShown } = this.state;

    if (!fetched || !isShown) return null;

    // width is 163 from onLayout
    const initialTop = safeAreaWidth < MD_WIDTH ? 74 : 82;
    const style = { top: initialTop, left: (safeAreaWidth - 163) / 2 };
    const updateBtnStyle = {
      paddingTop: 4,
      paddingRight: 0,
      paddingBottom: 5,
      paddingLeft: 12,
    };
    const closeBtnStyle = { marginRight: 8 };

    return (
      <View style={cache('FP_view', [tailwind('absolute flex-row items-center bg-blue-500 rounded-full shadow-lg z-30'), style], safeAreaWidth)}>
        <TouchableOpacity onPress={this.onUpdateBtnClick} style={cache('FP_updateBtn', updateBtnStyle)}>
          <Text style={tailwind('text-sm text-white font-normal')}>There is an update</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onCloseBtnClick} style={cache('FP_cancelBtn', [tailwind('ml-1 flex-shrink-0 flex-row items-center justify-center h-4 w-4 rounded-full'), closeBtnStyle])}>
          <Svg style={tailwind('text-base text-blue-100 font-normal')} width={8} height={8} viewBox="0 0 8 8" stroke="currentColor" fill="none">
            <Path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </Svg>
        </TouchableOpacity>
      </View>
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

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  SD_HUB_URL, MAX_SELECTED_LINK_IDS, SD_MAX_SELECTED_LINK_IDS,
} from '../types/const';
import { addSelectedLinkIds, deleteSelectedLinkIds } from '../actions/chunk';
import {
  makeIsLinkIdSelected, getSelectedLinkIdsLength, getThemeMode,
} from '../selectors';
import { popupFMV } from '../types/animConfigs';

import { withTailwind } from '.';

class CardItemSelector extends React.Component<any, any> {

  circleScale: Animated.Value;
  maxErrorScale: Animated.Value;

  constructor(props) {
    super(props);

    this.state = {
      didCloseAnimEnd: !props.isBulkEditing,
      isMaxErrorShown: false,
      didMaxErrorCloseAnimEnd: true,
    };

    this.circleScale = new Animated.Value(0);
    this.maxErrorScale = new Animated.Value(0);
  }

  componentDidMount() {
    if (this.props.isBulkEditing) {
      Animated.timing(
        this.circleScale, { toValue: 1, ...popupFMV.visible }
      ).start();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isBulkEditing } = this.props;
    const { isMaxErrorShown } = this.state;

    if (!prevProps.isBulkEditing && isBulkEditing) {
      Animated.timing(
        this.circleScale, { toValue: 1, ...popupFMV.visible }
      ).start();
    }

    if (prevProps.isBulkEditing && !isBulkEditing) {
      Animated.timing(
        this.circleScale, { toValue: 0, ...popupFMV.hidden }
      ).start(() => {
        requestAnimationFrame(() => {
          this.setState({ didCloseAnimEnd: true });
        });
      });
    }

    if (!prevState.isMaxErrorShown && isMaxErrorShown) {
      Animated.timing(
        this.maxErrorScale, { toValue: 1, ...popupFMV.visible }
      ).start();
    }

    if (prevState.isMaxErrorShown && !isMaxErrorShown) {
      Animated.timing(
        this.maxErrorScale, { toValue: 0, ...popupFMV.hidden }
      ).start(() => {
        requestAnimationFrame(() => {
          this.setState({ didMaxErrorCloseAnimEnd: true });
        });
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {

    if (!this.props.isBulkEditing && nextProps.isBulkEditing) {
      if (this.state.didCloseAnimEnd) {
        this.setState({ didCloseAnimEnd: false });
      }
    }

    if (
      this.state.isMaxErrorShown === true &&
      nextProps.selectedLinkIdsLength < nextProps.maxSelectedLinkIds
    ) {
      this.setState({ isMaxErrorShown: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.linkId !== nextProps.linkId ||
      this.props.isBulkEditing !== nextProps.isBulkEditing ||
      this.props.isSelected !== nextProps.isSelected ||
      this.props.tailwind !== nextProps.tailwind ||
      this.state.didCloseAnimEnd !== nextState.didCloseAnimEnd ||
      this.state.isMaxErrorShown !== nextState.isMaxErrorShown ||
      this.state.didMaxErrorCloseAnimEnd !== nextState.didMaxErrorCloseAnimEnd
    ) {
      return true;
    }

    return false;
  }

  onSelectBtnClick = () => {

    const { linkId, isSelected, selectedLinkIdsLength, maxSelectedLinkIds } = this.props;

    if (!isSelected && selectedLinkIdsLength === maxSelectedLinkIds) {
      this.setState({ isMaxErrorShown: true, didMaxErrorCloseAnimEnd: false });
      return;
    }
    this.setState({ isMaxErrorShown: false });

    if (isSelected) this.props.deleteSelectedLinkIds([linkId]);
    else this.props.addSelectedLinkIds([linkId]);
  };

  renderMaxError() {
    if (!this.state.isMaxErrorShown && this.state.didMaxErrorCloseAnimEnd) return null;

    const { maxSelectedLinkIds, tailwind } = this.props;
    const maxErrorStyle = {
      transform: [{
        scale: this.maxErrorScale.interpolate({
          inputRange: [0, 1], outputRange: [0.95, 1],
        }),
      }],
    };

    return (
      <View style={tailwind('absolute inset-x-0 top-0 items-center justify-center')}>
        <Animated.View style={[tailwind('m-4 rounded-md bg-red-50 p-4 shadow'), maxErrorStyle]}>
          <View style={tailwind('w-full flex-row')}>
            <View style={tailwind('flex-shrink-0 flex-grow-0')}>
              <Svg style={tailwind('font-normal text-red-400')} width={24} height={24} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </Svg>
            </View>
            <View style={tailwind('ml-3 flex-shrink flex-grow')}>
              <Text style={tailwind('text-left text-sm font-normal leading-5 text-red-800')}>To prevent network overload, up to {maxSelectedLinkIds} items can be selected.</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  render() {
    if (!this.props.isBulkEditing && this.state.didCloseAnimEnd) return null;

    const { isSelected, tailwind } = this.props;

    const circleStyleClasses = isSelected ? 'bg-gray-800 blk:border blk:border-gray-700' : 'bg-white opacity-70';
    const svgStyleClasses = isSelected ? 'text-gray-50' : 'text-gray-500';

    const circleStyle = {
      transform: [{
        scale: this.circleScale.interpolate({
          inputRange: [0, 1], outputRange: [0.95, 1],
        }),
      }],
    };

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 rounded-lg bg-black bg-opacity-40')} />
        <TouchableOpacity activeOpacity={1.0} onPress={this.onSelectBtnClick} style={tailwind('absolute inset-0 items-center justify-center bg-transparent')}>
          <Animated.View style={[tailwind(`h-32 w-32 items-center justify-center rounded-full ${circleStyleClasses}`), circleStyle]}>
            <Svg style={tailwind(`font-normal ${svgStyleClasses}`)} width={80} height={80} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
            </Svg>
          </Animated.View>
        </TouchableOpacity>
        {this.renderMaxError()}
      </React.Fragment>
    );
  }
}

CardItemSelector.propTypes = {
  linkId: PropTypes.string.isRequired,
};

const makeMapStateToProps = () => {

  const isLinkIdSelected = makeIsLinkIdSelected();

  const mapStateToProps = (state, props) => {
    let maxSelectedLinkIds = MAX_SELECTED_LINK_IDS;
    if (state.user.hubUrl === SD_HUB_URL) maxSelectedLinkIds = SD_MAX_SELECTED_LINK_IDS;

    return {
      isBulkEditing: state.display.isBulkEditing,
      isSelected: isLinkIdSelected(state, props),
      selectedLinkIdsLength: getSelectedLinkIdsLength(state),
      maxSelectedLinkIds,
      themeMode: getThemeMode(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { addSelectedLinkIds, deleteSelectedLinkIds };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItemSelector));

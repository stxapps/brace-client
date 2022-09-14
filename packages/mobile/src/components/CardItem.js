import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, SM_WIDTH, PINNED } from '../types/const';
import { makeGetPinStatus, getThemeMode } from '../selectors';
import {
  ensureContainUrlProtocol, isDiedStatus, isPinningStatus, isEqual,
} from '../utils';
import cache from '../utils/cache';

import { withTailwind } from '.';

import CardItemContent from './CardItemContent';
import CardItemSelector from './CardItemSelector';

class CardItem extends React.Component {

  constructor(props) {
    super(props);

    this.didClick = false;
  }

  componentDidUpdate(prevProps) {
    if (!isDiedStatus(prevProps.link.status) && isDiedStatus(this.props.link.status)) {
      this.didClick = false;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.style !== nextProps.style ||
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
      this.props.pinStatus !== nextProps.pinStatus ||
      this.props.safeAreaWidth !== nextProps.safeAreaWidth ||
      this.props.tailwind !== nextProps.tailwind
    ) {
      return true;
    }

    return false;
  }

  onRetryRetryBtnClick = () => {
    if (this.didClick) return;
    this.props.retryDiedLinks([this.props.link.id]);
    this.didClick = true;
  }

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  }

  renderRetry() {
    const { tailwind } = this.props;
    const { url } = this.props.link;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 rounded-lg bg-black bg-opacity-75')} />
        <View style={tailwind('absolute inset-0 items-center justify-center rounded-lg bg-transparent px-4')}>
          <Text style={tailwind('text-center text-base font-semibold text-white')}>Oops..., something went wrong!</Text>
          <View style={tailwind('flex-row items-center justify-center pt-4')}>
            <TouchableOpacity onPress={this.onRetryRetryBtnClick}>
              <View style={tailwind('rounded-full border border-white bg-white px-4 py-1')}>
                <Text style={tailwind('text-center text-sm font-medium text-gray-500')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onRetryCancelBtnClick}>
              <View style={tailwind('ml-4 rounded-full border border-gray-100 px-3 py-1')}>
                <Text style={tailwind('text-center text-sm font-medium text-gray-100')}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind('mt-4 text-center text-sm font-medium tracking-wide text-white')}>Go to the link</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }

  renderBusy() {
    const { tailwind } = this.props;

    const triangleStyle = {
      transform: [{ 'translateX': 32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 66,
      left: 34,
      transform: [{ 'translateX': -12 }, { 'translateY': -24 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 right-0 h-16 w-16 overflow-hidden rounded-tr-lg bg-transparent')}>
        <View style={cache('CI_busyTriangle', [tailwind('h-16 w-16 overflow-hidden bg-white blk:bg-gray-800'), triangleStyle], [tailwind])}>
          <Svg style={cache('CI_busySvg', [tailwind('h-6 w-6 font-normal text-gray-700 blk:text-gray-200'), svgStyle], [tailwind])} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  }

  renderPinning() {
    const { tailwind } = this.props;

    const triangleStyle = {
      transform: [{ 'translateX': -32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 46,
      left: 54,
      transform: [{ 'translateX': -12 }, { 'translateY': -24 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 left-0 h-16 w-16 overflow-hidden rounded-tl-lg bg-transparent')}>
        <View style={cache('CI_pinningTriangle', [tailwind('h-16 w-16 overflow-hidden bg-white blk:bg-gray-800'), triangleStyle], [tailwind])}>
          <Svg style={cache('CI_pinningSvg', [tailwind('h-6 w-6 font-normal text-gray-700 blk:text-gray-200'), svgStyle], [tailwind])} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  }

  renderPin() {
    const { tailwind } = this.props;

    const triangleStyle = {
      transform: [{ 'translateX': -32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 42,
      left: 54,
      transform: [{ 'translateX': -8 }, { 'translateY': -16 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 left-0 h-16 w-16 overflow-hidden rounded-tl-lg bg-transparent')}>
        <View style={cache('CI_pinTriangle', [tailwind('h-16 w-16 overflow-hidden bg-white blk:bg-gray-800'), triangleStyle], [tailwind])}>
          <Svg style={cache('CI_pinSvg', [tailwind('font-normal text-gray-500 blk:text-gray-300'), svgStyle], [tailwind])} width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M20.2349 14.61C19.8599 12.865 17.8929 11.104 16.2249 10.485L15.6809 5.53698L17.1759 3.29498C17.3329 3.05898 17.3479 2.75698 17.2129 2.50798C17.0789 2.25798 16.8209 2.10498 16.5379 2.10498H7.39792C7.11392 2.10498 6.85592 2.25898 6.72192 2.50798C6.58792 2.75798 6.60192 3.06098 6.75992 3.29598L8.25792 5.54298L7.77392 10.486C6.10592 11.106 4.14092 12.866 3.76992 14.602C3.72992 14.762 3.75392 15.006 3.90192 15.196C4.00492 15.328 4.20592 15.486 4.58192 15.486H8.63992L11.5439 22.198C11.6219 22.382 11.8039 22.5 12.0019 22.5C12.1999 22.5 12.3819 22.382 12.4619 22.198L15.3649 15.485H19.4219C19.7979 15.485 19.9979 15.329 20.1019 15.199C20.2479 15.011 20.2739 14.765 20.2369 14.609L20.2349 14.61Z" />
          </Svg>
        </View>
      </View>
    );
  }

  render() {
    const { style, link, pinStatus, safeAreaWidth, tailwind } = this.props;
    const { status } = link;

    const isPinning = isPinningStatus(pinStatus);
    const canSelect = ![ADDING, MOVING].includes(status) && !isPinning;

    // Need to do this as React Native doesn't support maxWidth: "none"
    //   even though it's in tailwind-rn.
    let viewStyle = safeAreaWidth < SM_WIDTH ? 'max-w-md' : '';

    if (Platform.OS === 'ios') viewStyle += ' border border-gray-200 shadow-sm';
    else viewStyle += ' shadow-card-android';

    return (
      <View style={style}>
        <View style={tailwind(`self-center rounded-lg bg-white blk:border-gray-700 blk:bg-gray-800 ${viewStyle}`)}>
          <CardItemContent link={link} />
          {[ADDING, MOVING].includes(status) && this.renderBusy()}
          {isPinning && this.renderPinning()}
          {[PINNED].includes(pinStatus) && this.renderPin()}
          {canSelect && <CardItemSelector linkId={link.id} />}
          {isDiedStatus(status) && this.renderRetry()}
        </View>
      </View>
    );
  }
}

CardItem.propTypes = {
  style: PropTypes.object.isRequired,
  link: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {

  const getPinStatus = makeGetPinStatus();

  const mapStateToProps = (state, props) => {
    const pinStatus = getPinStatus(state, props.link);

    return {
      pinStatus,
      themeMode: getThemeMode(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { retryDiedLinks, cancelDiedLinks };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItem));

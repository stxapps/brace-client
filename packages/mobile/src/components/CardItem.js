import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING, SM_WIDTH } from '../types/const';
import { ensureContainUrlProtocol, isDiedStatus, isEqual } from '../utils';
import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import { withSafeAreaContext } from '.';

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
      this.props.safeAreaWidth !== nextProps.safeAreaWidth
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
    let { url } = this.props.link;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-black opacity-75 rounded-lg elevation-xs')} />
        <View style={tailwind('px-4 absolute inset-0 justify-center items-center bg-transparent rounded-lg elevation-xs')}>
          <Text style={tailwind('text-2xl text-white font-medium text-center')}>Oops..., something went wrong!</Text>
          <View style={tailwind('pt-4 flex-row justify-center items-center')}>
            <TouchableOpacity onPress={this.onRetryRetryBtnClick}>
              <View style={tailwind('px-4 py-1 bg-white border border-white rounded-full')}>
                <Text style={tailwind('text-base text-gray-900 font-semibold text-center')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onRetryCancelBtnClick}>
              <View style={tailwind('ml-4 px-3 py-1 border border-white rounded-full')}>
                <Text style={tailwind('text-base text-white font-semibold text-center')}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind('mt-10 text-base text-white font-medium text-center')}>Go to the link</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }

  renderBusy() {

    const triangleStyle = {
      transform: [{ 'translateX': 32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };

    const svgStyle = {
      top: 66,
      left: 34,
      transform: [{ 'translateX': -12 }, { 'translateY': -24 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 right-0 w-16 h-16 bg-transparent rounded-tr-lg overflow-hidden')}>
        <View style={cache('CI_busyTriangle', [tailwind('w-16 h-16 bg-white overflow-hidden'), triangleStyle])}>
          <Svg style={cache('CI_busySvg', [tailwind('w-6 h-6 text-base text-gray-900 font-normal'), svgStyle])} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  }

  render() {

    const { style, link, safeAreaWidth } = this.props;
    const { status } = link;

    // Need to do this as React Native doesn't support maxWidth: "none"
    //   even though it's in tailwind-rn.
    const viewStyle = safeAreaWidth < SM_WIDTH ? 'max-w-md' : '';

    return (
      <View style={style}>
        <View style={tailwind(`self-center bg-white rounded-lg shadow ${viewStyle}`)}>
          <CardItemContent link={link} />
          {isDiedStatus(status) && this.renderRetry()}
          {[ADDING, MOVING].includes(status) && this.renderBusy()}
          {![ADDING, MOVING].includes(status) && <CardItemSelector linkId={link.id} />}
        </View>
      </View>
    );
  }
}

CardItem.propTypes = {
  style: PropTypes.object.isRequired,
  link: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { retryDiedLinks, cancelDiedLinks };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(CardItem));

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { retryDiedLinks, cancelDiedLinks } from '../actions/chunk';
import { ADDING, MOVING, UPDATING, EXTRD_UPDATING, PINNED } from '../types/const';
import {
  makeGetPinStatus, makeGetTagStatus, getSafeAreaWidth, getThemeMode,
} from '../selectors';
import {
  ensureContainUrlProtocol, isDiedStatus, isPinningStatus, isTaggingStatus, isEqual,
} from '../utils';

import { withTailwind } from '.';

import CardItemContent from './CardItemContent';
import CardItemSelector from './CardItemSelector';

class CardItem extends React.Component<any, any> {

  didClick: boolean;

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
      this.props.link.id !== nextProps.link.id ||
      this.props.link.url !== nextProps.link.url ||
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.link.decor, nextProps.link.decor) ||
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult) ||
      !isEqual(this.props.link.custom, nextProps.link.custom) ||
      this.props.link.doIgnoreExtrdRst !== nextProps.link.doIgnoreExtrdRst ||
      this.props.pinStatus !== nextProps.pinStatus ||
      this.props.tagStatus !== nextProps.tagStatus ||
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
  };

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  };

  renderRetry() {
    const { tailwind } = this.props;
    const { url } = this.props.link;

    return (
      <React.Fragment>
        <div className={tailwind('absolute inset-0 bg-black bg-opacity-75')} />
        <div className={tailwind('absolute inset-0 flex flex-col items-center justify-center bg-transparent px-4')}>
          <h3 className={tailwind('text-center text-base font-semibold text-white')}>Oops..., something went wrong!</h3>
          <div className={tailwind('flex items-center justify-center pt-4')}>
            <button onClick={this.onRetryRetryBtnClick} className={tailwind('rounded-full border border-white bg-white px-4 py-1 text-sm font-medium text-gray-500 hover:bg-gray-700 hover:text-gray-50 focus:outline-none focus:ring focus:ring-blue-300')}>Retry</button>
            <button onClick={this.onRetryCancelBtnClick} className={tailwind('ml-4 rounded-full border border-gray-100 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-700 hover:text-gray-50 focus:outline-none focus:ring focus:ring-blue-300')}>Cancel</button>
          </div>
          <a className={tailwind('mt-4 block w-full text-center text-sm font-medium tracking-wide text-white hover:underline focus:outline-none focus:ring focus:ring-blue-300')} href={ensureContainUrlProtocol(url)} target="_blank" rel="noreferrer">Go to the link</a>
        </div>
      </React.Fragment>
    );
  }

  renderBusy() {
    const { tailwind } = this.props;
    const svgStyle = { top: '66px', left: '34px' };

    return (
      <div className={tailwind('absolute top-0 right-0 h-16 w-16 overflow-hidden bg-transparent')}>
        <div className={tailwind('relative h-16 w-16 translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden bg-white blk:bg-gray-800')}>
          <svg style={svgStyle} className={tailwind('relative h-6 w-6 -translate-x-1/2 -translate-y-full -rotate-45 transform text-gray-700 blk:text-gray-200')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  }

  renderPinning() {
    const { tailwind } = this.props;
    const svgStyle = { top: '46px', left: '54px' };

    return (
      <div className={tailwind('absolute top-0 left-0 h-16 w-16 overflow-hidden bg-transparent')}>
        <div className={tailwind('relative h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden bg-white blk:bg-gray-800')}>
          <svg style={svgStyle} className={tailwind('relative h-6 w-6 -translate-x-1/2 -translate-y-full -rotate-45 transform text-gray-700 blk:text-gray-200')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  }

  renderPin() {
    const { tailwind } = this.props;
    const svgStyle = { top: '42px', left: '54px' };

    return (
      <div className={tailwind('absolute top-0 left-0 h-16 w-16 overflow-hidden bg-transparent')}>
        <div className={tailwind('relative h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 transform overflow-hidden bg-white blk:bg-gray-800')}>
          <svg style={svgStyle} className={tailwind('relative h-4 w-4 -translate-x-1/2 -translate-y-full -rotate-45 transform text-gray-500 blk:text-gray-300')} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.2349 14.61C19.8599 12.865 17.8929 11.104 16.2249 10.485L15.6809 5.53698L17.1759 3.29498C17.3329 3.05898 17.3479 2.75698 17.2129 2.50798C17.0789 2.25798 16.8209 2.10498 16.5379 2.10498H7.39792C7.11392 2.10498 6.85592 2.25898 6.72192 2.50798C6.58792 2.75798 6.60192 3.06098 6.75992 3.29598L8.25792 5.54298L7.77392 10.486C6.10592 11.106 4.14092 12.866 3.76992 14.602C3.72992 14.762 3.75392 15.006 3.90192 15.196C4.00492 15.328 4.20592 15.486 4.58192 15.486H8.63992L11.5439 22.198C11.6219 22.382 11.8039 22.5 12.0019 22.5C12.1999 22.5 12.3819 22.382 12.4619 22.198L15.3649 15.485H19.4219C19.7979 15.485 19.9979 15.329 20.1019 15.199C20.2479 15.011 20.2739 14.765 20.2369 14.609L20.2349 14.61Z" />
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { link, pinStatus, tagStatus, tailwind } = this.props;
    const { status } = link;

    const isPinning = isPinningStatus(pinStatus);
    const isTagging = isTaggingStatus(tagStatus);
    const canSelect = (
      ![ADDING, MOVING, UPDATING, EXTRD_UPDATING].includes(status) &&
      !isPinning &&
      !isTagging
    );

    return (
      <div className={tailwind('relative mx-auto max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm blk:border-gray-700 blk:bg-gray-800 sm:max-w-none')}>
        <CardItemContent link={link} />
        {[ADDING, MOVING, UPDATING, EXTRD_UPDATING].includes(status) && this.renderBusy()}
        {isPinning && this.renderPinning()}
        {isTagging && this.renderBusy()}
        {[PINNED].includes(pinStatus) && this.renderPin()}
        {canSelect && <CardItemSelector linkId={link.id} />}
        {isDiedStatus(status) && this.renderRetry()}
      </div>
    );
  }
}

CardItem.propTypes = {
  link: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {

  const getPinStatus = makeGetPinStatus();
  const getTagStatus = makeGetTagStatus();

  const mapStateToProps = (state, props) => {
    const pinStatus = getPinStatus(state, props.link);
    const tagStatus = getTagStatus(state, props.link);

    return {
      pinStatus,
      tagStatus,
      themeMode: getThemeMode(state),
      safeAreaWidth: getSafeAreaWidth(state),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = { retryDiedLinks, cancelDiedLinks };

export default connect(makeMapStateToProps, mapDispatchToProps)(withTailwind(CardItem));

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { retryDiedLinks, cancelDiedLinks } from '../actions';
import { ADDING, MOVING } from '../types/const';
import { ensureContainUrlProtocol, isDiedStatus, isEqual } from '../utils';

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
      this.props.link.status !== nextProps.link.status ||
      !isEqual(this.props.link.extractedResult, nextProps.link.extractedResult)
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
        <div className="absolute inset-0 bg-black opacity-75" />
        <div className="px-4 absolute inset-0 flex flex-col justify-center items-center bg-transparent">
          <h3 className="text-2xl text-white font-medium text-center">Oops..., something went wrong!</h3>
          <div className="pt-4 flex justify-center items-center">
            <button onClick={this.onRetryRetryBtnClick} className="px-4 py-1 bg-white text-base text-gray-900 font-semibold rounded-full border border-white hover:bg-gray-900 hover:text-white active:bg-black focus:outline-none focus:shadow-outline">Retry</button>
            <button onClick={this.onRetryCancelBtnClick} className="ml-4 px-3 py-1 text-base text-white font-semibold rounded-full border border-white hover:bg-gray-100 hover:text-gray-900 active:bg-white focus:outline-none focus:shadow-outline">Cancel</button>
          </div>
          <a className="block mt-10 w-full text-base text-white font-medium text-center hover:underline focus:outline-none focus:shadow-outline" href={ensureContainUrlProtocol(url)}>Go to the link</a>
        </div>
      </React.Fragment>
    );
  }

  renderBusy() {

    const svgStyle = { top: '66px', left: '34px' };

    return (
      <div className="absolute top-0 right-0 w-16 h-16 bg-transparent overflow-hidden">
        <div className="relative w-16 h-16 bg-white overflow-hidden transform rotate-45 translate-x-1/2 -translate-y-1/2">
          <svg style={svgStyle} className="relative w-6 h-6 text-gray-900 transform -rotate-45 -translate-x-1/2 -translate-y-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </svg>
        </div>
      </div>
    );
  }

  render() {

    const { link } = this.props;
    const { status } = link;

    return (
      <div className="mx-auto relative max-w-md bg-white border-1 border-gray-200 rounded-lg overflow-hidden shadow sm:max-w-none">
        <CardItemContent link={link} />
        {isDiedStatus(status) && this.renderRetry()}
        {[ADDING, MOVING].includes(status) && this.renderBusy()}
        {![ADDING, MOVING].includes(status) && <CardItemSelector linkId={link.id} />}
      </div>
    );
  }
}

CardItem.propTypes = {
  link: PropTypes.object.isRequired,
};

const mapDispatchToProps = { retryDiedLinks, cancelDiedLinks };

export default connect(null, mapDispatchToProps)(CardItem);

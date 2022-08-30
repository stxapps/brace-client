import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updatePopup } from '../actions';
import {
  SIGN_IN_POPUP, SHOW_BLANK, SHOW_SIGN_IN, SHOW_COMMANDS, MD_WIDTH,
} from '../types/const';
import { getThemeMode } from '../selectors';
import { toPx, throttle } from '../utils';

import { getTopBarSizes, withTailwind } from '.';

import TopBarCommands from './TopBarCommands';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';
import ListName from './ListName';
import StatusPopup from './StatusPopup';

import shortLogo from '../images/logo-short.svg';

class TopBar extends React.PureComponent {

  constructor(props) {
    super(props);

    const { listNameDistanceY } = getTopBarSizes(props.safeAreaWidth);

    this.state = {
      offsetY: Math.min(window.pageYOffset, listNameDistanceY),
    };

    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {
    if (this.props.isListNameShown) {
      window.addEventListener('scroll', this.updateScrollY);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
  }

  updateScrollY = () => {
    const { safeAreaWidth } = this.props;
    const { listNameDistanceY } = getTopBarSizes(safeAreaWidth);
    if (window.pageYOffset >= listNameDistanceY && this.state.offsetY >= listNameDistanceY) return;
    this.setState({ offsetY: Math.min(window.pageYOffset, listNameDistanceY) });
  }

  onSignInBtnClick = () => {
    this.props.updatePopup(SIGN_IN_POPUP, true);
  }

  renderSignInBtn() {
    const { tailwind } = this.props;

    return (
      <button onClick={this.onSignInBtnClick} className={tailwind('group block h-14 focus:outline-none')}>
        <span className={tailwind('rounded-full border border-gray-400 bg-white px-2.5 py-1.5 text-sm text-gray-500 group-hover:border-gray-500 group-hover:text-gray-600 group-focus:ring')}>Sign in</span>
      </button>
    );
  }

  renderListName() {
    const { safeAreaWidth, tailwind } = this.props;
    const { offsetY } = this.state;
    const {
      listNameDistanceX,
      listNameStartY, listNameEndY, listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    let top = listNameStartY + (offsetY * (listNameEndY - listNameStartY) / listNameDistanceY) + 3;
    const left = offsetY * listNameDistanceX / listNameDistanceY;

    const listNameStyle = { top, left };
    return (
      <div style={listNameStyle} className={tailwind('absolute')}>
        <ListName />
      </div >
    );
  }

  renderStatusPopup() {
    const { safeAreaWidth, tailwind } = this.props;
    const { offsetY } = this.state;
    const {
      statusPopupDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const initialTop = safeAreaWidth < MD_WIDTH ? '4.75rem' : '5.25rem';
    const top = Math.max(0, toPx(initialTop) - offsetY);
    const right = 0;
    const opacity = Math.max(0, 1.0 - (offsetY / statusPopupDistanceY));
    const visibility = offsetY >= statusPopupDistanceY ? 'hidden' : 'visible';

    const statusPopupStyle = { top, right, opacity, visibility };
    return (
      /** @ts-ignore */
      <div style={statusPopupStyle} className={tailwind('absolute')}>
        <StatusPopup />
      </div>
    );
  }

  render() {
    const {
      rightPane: rightPaneProp, isBulkEditing, safeAreaWidth, tailwind,
    } = this.props;

    let rightPane;
    if (rightPaneProp === SHOW_BLANK) rightPane = null;
    else if (rightPaneProp === SHOW_SIGN_IN) rightPane = this.renderSignInBtn();
    else if (rightPaneProp === SHOW_COMMANDS) {
      rightPane = isBulkEditing ? <TopBarBulkEditCommands /> : <TopBarCommands />;
    } else throw new Error(`Invalid rightPane: ${rightPaneProp}`);

    const { isListNameShown } = this.props;

    let topBarStyle, topBarStyleClasses;
    if (isListNameShown) {

      const { offsetY } = this.state;
      const {
        topBarHeight, headerHeight,
        listNameDistanceY,
      } = getTopBarSizes(safeAreaWidth);

      const height = topBarHeight + (offsetY * (headerHeight - topBarHeight) / listNameDistanceY);

      topBarStyle = { height };
      topBarStyleClasses = 'fixed inset-x-0 top-0 bg-white z-30';
      if (height === headerHeight) {
        topBarStyleClasses += ' border-b border-gray-200';
      }
    } else {
      const { headerHeight } = getTopBarSizes(safeAreaWidth);
      topBarStyle = { height: headerHeight };
      topBarStyleClasses = '';
    }

    return (
      <div style={topBarStyle} className={tailwind(`mx-auto max-w-6xl px-4 md:px-6 lg:px-8 ${topBarStyleClasses}`)}>
        <div className={tailwind('relative')}>
          <header className={tailwind('flex h-14 items-center justify-between')}>
            <div className={tailwind('relative')}>
              <img className={tailwind('h-8')} src={shortLogo} alt="Brace logo" />
            </div>
            {rightPane}
          </header>
          {isListNameShown && this.renderListName()}
          {isListNameShown && this.renderStatusPopup()}
        </div>
      </div>
    );
  }
}

TopBar.propTypes = {
  rightPane: PropTypes.string.isRequired,
  isListNameShown: PropTypes.bool,
};

TopBar.defaultProps = {
  isListNameShown: false,
};

const mapStateToProps = (state, props) => {
  return {
    isBulkEditing: state.display.isBulkEditing,
    themeMode: getThemeMode(state),
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = { updatePopup };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBar));

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { SHOW_COMMANDS, MD_WIDTH, BLK_MODE } from '../types/const';
import { getSafeAreaWidth, getSafeAreaInsets, getThemeMode } from '../selectors';
import { toPx, throttle } from '../utils';

import { getTopBarSizes, withTailwind } from '.';

import TopBarCommands from './TopBarCommands';
import TopBarBulkEditCommands from './TopBarBulkEditCommands';
import TopBarTitle from './TopBarTitle';
import StatusPopup from './StatusPopup';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

class TopBarMain extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);

    const { listNameDistanceY } = getTopBarSizes(props.safeAreaWidth);

    this.state = {
      scrollY: Math.min(window.scrollY, listNameDistanceY),
    };

    this.updateScrollY = throttle(this.updateScrollY, 16);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateScrollY);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollY);
  }

  updateScrollY = () => {
    const { safeAreaWidth } = this.props;
    const { listNameDistanceY } = getTopBarSizes(safeAreaWidth);
    if (window.scrollY >= listNameDistanceY && this.state.scrollY >= listNameDistanceY) {
      return;
    }
    this.setState({ scrollY: Math.min(window.scrollY, listNameDistanceY) });
  };

  renderListName() {
    const { safeAreaWidth, tailwind } = this.props;
    const { scrollY } = this.state;
    const {
      listNameDistanceX,
      listNameStartY, listNameEndY, listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    let top = (
      listNameStartY + (scrollY * (listNameEndY - listNameStartY) / listNameDistanceY)
    );
    const left = scrollY * listNameDistanceX / listNameDistanceY;

    const listNameStyle = { top, left };
    return (
      <div style={listNameStyle} className={tailwind('absolute')}>
        <TopBarTitle />
      </div >
    );
  }

  renderStatusPopup() {
    const { safeAreaWidth, tailwind } = this.props;
    const { scrollY } = this.state;
    const { statusPopupDistanceY } = getTopBarSizes(safeAreaWidth);

    const initialTop = safeAreaWidth < MD_WIDTH ? '4.5625rem' : '5.0625rem';
    const top = Math.max(0, toPx(initialTop) - scrollY);
    const right = 0;
    const opacity = Math.max(0, 1.0 - (scrollY / statusPopupDistanceY));
    const visibility = scrollY >= statusPopupDistanceY ? 'hidden' : 'visible';

    const statusPopupStyle: any = { top, right, opacity, visibility };
    return (
      <div style={statusPopupStyle} className={tailwind('absolute')}>
        <StatusPopup />
      </div>
    );
  }

  render() {
    const {
      rightPane: rightPaneProp, isBulkEditing, themeMode, safeAreaWidth, insets,
      tailwind,
    } = this.props;

    let rightPane = null;
    if (rightPaneProp === SHOW_COMMANDS) {
      rightPane = isBulkEditing ? <TopBarBulkEditCommands /> : <TopBarCommands />;
    }

    const { scrollY } = this.state;
    const {
      topBarHeight, headerHeight, listNameDistanceY,
    } = getTopBarSizes(safeAreaWidth);

    const height = (
      topBarHeight + (scrollY * (headerHeight - topBarHeight) / listNameDistanceY)
    );

    const tbStyle = {
      paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
    }
    const style = { height };

    let classes = '';
    if (height === headerHeight) {
      classes = 'border-b border-gray-200 blk:border-gray-700';
    }

    return (
      <div style={tbStyle} className={tailwind('fixed inset-x-0 top-0 z-30 bg-white blk:bg-gray-900')}>
        <div style={style} className={tailwind(`mx-auto max-w-6xl px-4 md:px-6 lg:px-8 ${classes}`)}>
          <div className={tailwind('relative')}>
            <div className={tailwind('flex h-14 items-center justify-between')}>
              <a className={tailwind('relative rounded focus:outline-none focus:ring focus:ring-offset-2')} href="/">
                <img className={tailwind('h-8')} src={themeMode === BLK_MODE ? LogoBlk : Logo} alt="Brace logo" />
              </a>
              {rightPane}
            </div>
            {this.renderStatusPopup()}
            {this.renderListName()}
          </div>
        </div>
      </div>
    );
  }
}

TopBarMain.propTypes = {
  rightPane: PropTypes.string.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    isBulkEditing: state.display.isBulkEditing,
    themeMode: getThemeMode(state),
    safeAreaWidth: getSafeAreaWidth(state),
    insets: getSafeAreaInsets(state),
  };
};

export default connect(mapStateToProps, null)(withTailwind(TopBarMain));

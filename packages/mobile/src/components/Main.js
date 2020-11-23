import React from 'react';
import { connect } from 'react-redux';
import { Animated } from 'react-native';

import {
  PC_100, PC_50, PC_33,
  SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH,
} from '../types/const';
import { getLinks } from '../selectors';

import { withSafeAreaContext } from '.';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import SettingsPopup from './SettingsPopup';

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    // BUG alert
    // When delete all data, fetched is not cleared!
    this.fetched = [];

    this.scrollY = new Animated.Value(0);
    this.scrollYEvent = Animated.event([{
      nativeEvent: { contentOffset: { y: this.scrollY } }
    }], { useNativeDriver: true });
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= SM_WIDTH) columnWidth = PC_50;
    if (safeAreaWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  render() {

    const { links, safeAreaWidth } = this.props;
    const columnWidth = this.getColumnWidth(safeAreaWidth);

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    return (
      <React.Fragment>
        <CardPanel columnWidth={columnWidth} fetched={this.fetched} scrollYEvent={this.scrollYEvent} />
        <TopBar rightPane={topBarRightPane} isListNameShown={true} fetched={this.fetched} scrollY={this.scrollY} />
        {columnWidth === PC_100 && <BottomBar />}
        <ConfirmDeletePopup />
        <SettingsPopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    links: getLinks(state),
    windowWidth: state.window.width,
  };
};

export default connect(mapStateToProps)(withSafeAreaContext(Main));

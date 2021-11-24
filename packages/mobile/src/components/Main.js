import React from 'react';
import { connect } from 'react-redux';
import { Animated, AppState } from 'react-native';

import { fetch, clearFetchedListNames } from '../actions';
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
import FetchedPopup from './FetchedPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsErrorPopup from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    this.scrollY = new Animated.Value(0);
    this.scrollYEvent = Animated.event([{
      nativeEvent: { contentOffset: { y: this.scrollY } },
    }], { useNativeDriver: true });
    this.appStateListener = null;
  }

  componentDidMount() {
    this.appStateListener = AppState.addEventListener(
      'change', this.handleAppStateChange
    );

    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.listName !== this.props.listName) this.fetch();
  }

  componentWillUnmount() {
    this.appStateListener.remove();
  }

  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') this.props.clearFetchedListNames();
    if (nextAppState === 'active') this.fetch();
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= SM_WIDTH) columnWidth = PC_50;
    if (safeAreaWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  fetch = () => {
    if (!this.props.fetchedListNames.includes(this.props.listName)) {
      const didFetch = this.props.fetchedListNames.length > 0;
      this.props.fetch(didFetch ? false : null, null, !didFetch);
    }
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
        <CardPanel columnWidth={columnWidth} scrollYEvent={this.scrollYEvent} />
        <TopBar rightPane={topBarRightPane} isListNameShown={true} scrollY={this.scrollY} />
        {columnWidth === PC_100 && <BottomBar />}
        <FetchedPopup />
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <SettingsErrorPopup />
        <ListNamesPopup />
        <ConfirmDeletePopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    links: getLinks(state),
    fetchedListNames: state.display.fetchedListNames,
    windowWidth: state.window.width,
  };
};

const mapDispatchToProps = { fetch, clearFetchedListNames };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));

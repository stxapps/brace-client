import React from 'react';
import { connect } from 'react-redux';
import { Animated } from 'react-native';

import { fetch } from '../actions';
import {
  PC_100, PC_50, PC_33,
  SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
} from '../types/const';
import { getLinks } from '../selectors';

import { withSafeAreaContext } from '.';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
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
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.didFetch !== this.props.didFetch ||
      prevProps.didFetchSettings !== this.props.didFetchSettings ||
      prevProps.fetchedListNames !== this.props.fetchedListNames
    ) this.fetch();
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= SM_WIDTH) columnWidth = PC_50;
    if (safeAreaWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  fetch = () => {
    const { listName, didFetch, didFetchSettings, fetchedListNames } = this.props;

    if (!fetchedListNames.includes(listName)) {
      this.props.fetch(didFetch ? false : null, null, !didFetchSettings);
    }
  }

  render() {

    const { links, layoutType, safeAreaWidth } = this.props;
    const columnWidth = this.getColumnWidth(safeAreaWidth);

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    return (
      <React.Fragment>
        {layoutType === LAYOUT_LIST ?
          <ListPanel columnWidth={columnWidth} scrollYEvent={this.scrollYEvent} /> :
          <CardPanel columnWidth={columnWidth} scrollYEvent={this.scrollYEvent} />
        }
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
    didFetch: state.display.didFetch,
    didFetchSettings: state.display.didFetchSettings,
    fetchedListNames: state.display.fetchedListNames,
    layoutType: state.localSettings.layoutType,
  };
};

const mapDispatchToProps = { fetch };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));

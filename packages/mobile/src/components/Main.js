import React from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';

import fileApi from '../apis/file';
import { fetch, rehydrateStaticFiles, endIapConnection } from '../actions';
import {
  PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS, SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
  IMAGES,
} from '../types/const';
import { getLinks } from '../selectors';

import { withSafeAreaContext } from '.';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import FetchedPopup from './FetchedPopup';
import PinMenuPopup from './PinMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import SettingsErrorPopup from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    this.scrollY = new Animated.Value(0);
    this.scrollYEvent = Animated.event([{
      nativeEvent: { contentOffset: { y: this.scrollY } },
    }], { useNativeDriver: true });
  }

  componentDidMount() {
    this.mkDirAndFetch();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.rehydratedListNames !== this.props.rehydratedListNames ||
      prevProps.didFetch !== this.props.didFetch ||
      prevProps.didFetchSettings !== this.props.didFetchSettings ||
      prevProps.fetchedListNames !== this.props.fetchedListNames
    ) this.fetch();
  }

  componentWillUnmount() {
    this.props.endIapConnection();
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= SM_WIDTH) columnWidth = PC_50;
    if (safeAreaWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  fetch = () => {
    const {
      listName, rehydratedListNames, didFetch, didFetchSettings, fetchedListNames,
    } = this.props;

    if (!rehydratedListNames.includes(listName)) {
      this.props.rehydrateStaticFiles();
      return;
    }

    if (!fetchedListNames.includes(listName)) {
      this.props.fetch(didFetch ? false : null, null, !didFetchSettings);
    }
  }

  mkDirAndFetch = async () => {
    try {
      const doExist = await fileApi.exists(IMAGES);
      if (!doExist) await fileApi.mkdir(IMAGES);
    } catch (e) {
      console.log('Can\'t make images dir with error: ', e);
    }

    this.fetch();
  }

  render() {
    const {
      listName, links, rehydratedListNames, layoutType, safeAreaWidth,
    } = this.props;
    const columnWidth = this.getColumnWidth(safeAreaWidth);

    if (links === null || !rehydratedListNames.includes(listName)) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    return (
      <React.Fragment>
        {layoutType === LAYOUT_LIST ?
          <ListPanel columnWidth={columnWidth} scrollYEvent={this.scrollYEvent} /> :
          <CardPanel columnWidth={columnWidth} scrollYEvent={this.scrollYEvent} />
        }
        {columnWidth === PC_100 && <BottomBar />}
        <TopBar rightPane={topBarRightPane} isListNameShown={true} doSupportTheme={true} scrollY={this.scrollY} />
        <FetchedPopup />
        <PinMenuPopup />
        <CustomEditorPopup />
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <TimePickPopup />
        <PinErrorPopup />
        <SettingsErrorPopup />
        <ListNamesPopup />
        <ConfirmDeletePopup />
        <PaywallPopup />
        <AccessErrorPopup />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    links: getLinks(state),
    rehydratedListNames: state.display.rehydratedListNames,
    didFetch: state.display.didFetch,
    didFetchSettings: state.display.didFetchSettings,
    fetchedListNames: state.display.fetchedListNames,
    layoutType: state.localSettings.layoutType,
  };
};

const mapDispatchToProps = { fetch, rehydrateStaticFiles, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));

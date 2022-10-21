import React from 'react';
import { connect } from 'react-redux';

import { updateHistoryPosition, fetch } from '../actions';
import {
  BACK_DECIDER, BACK_POPUP,
  PC_100, PC_50, PC_33,
  SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
} from '../types/const';
import { getLinks, getThemeMode } from '../selectors';

import { withTailwind } from '.';
import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import FetchedPopup from './FetchedPopup';
import CardItemMenuPopup from './CardItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import PinErrorPopup from './PinErrorPopup';
import SettingsErrorPopup from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';

class Main extends React.PureComponent {

  componentDidMount() {
    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, '', window.location.href);
      window.history.pushState(BACK_POPUP, '', window.location.href);
    }

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
    const { links, layoutType, safeAreaWidth, tailwind } = this.props;
    const columnWidth = this.getColumnWidth(safeAreaWidth);

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    return (
      <div className={tailwind('min-h-screen bg-white blk:bg-gray-900')}>
        {layoutType === LAYOUT_LIST ?
          <ListPanel columnWidth={columnWidth} /> :
          <CardPanel columnWidth={columnWidth} />
        }
        {/* BottomBar before TopBar so listNamePopup's bg in TopBar's above BottomBar */}
        {columnWidth === PC_100 && <BottomBar />}
        <TopBar rightPane={topBarRightPane} isListNameShown={true} doSupportTheme={true} />
        <FetchedPopup />
        <CardItemMenuPopup />
        <PinMenuPopup />
        <CustomEditorPopup />
        <SettingsPopup />
        <SettingsListsMenuPopup />
        <PinErrorPopup />
        <SettingsErrorPopup />
        <ListNamesPopup />
        <ConfirmDeletePopup />
        <PaywallPopup />
        <AccessErrorPopup />
      </div>
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
    themeMode: getThemeMode(state),
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = { updateHistoryPosition, fetch };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(Main));

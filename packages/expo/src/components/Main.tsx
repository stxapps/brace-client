import React from 'react';
import { Animated } from 'react-native';
import { connect } from 'react-redux';

import fileApi from '../apis/localFile';
import { fetch } from '../actions/chunk';
import { endIapConnection } from '../actions/iap';
import {
  PC_100, PC_50, PC_33, SHOW_BLANK, SHOW_COMMANDS, SM_WIDTH, LG_WIDTH, LAYOUT_LIST,
  IMAGES,
} from '../types/const';
import { getIsShowingLinkIdsNull, getLayoutType } from '../selectors';
import { toPx } from '../utils';

import { withSafeAreaContext } from '.';

import TopBarMain from './TopBarMain';
import TopBarAddPopup from './TopBarAddPopup';
import TopBarProfilePopup from './TopBarProfilePopup';
import BottomBar from './BottomBar';
import BottomBarAddPopup from './BottomBarAddPopup';
import BottomBarSearchPopup from './BottomBarSearchPopup';
import BottomBarProfilePopup from './BottomBarProfilePopup';
import CardPanel from './CardPanel';
import ListPanel from './ListPanel';
import LockPanel from './LockPanel';
import FetchedPopup from './FetchedPopup';
import CardItemMenuPopup from './CardItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import CustomEditorPopup from './CustomEditorPopup';
import TagEditorPopup from './TagEditorPopup';
import GlobalPopups from './GlobalPopups';

class Main extends React.PureComponent<any, any> {

  scrollY: any;

  constructor(props) {
    super(props);

    this.scrollY = new Animated.Value(0);
  }

  componentDidMount() {
    this.mkDirAndFetch();
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.listName !== this.props.listName) ||
      (prevProps.queryString !== this.props.queryString) ||
      (prevProps.didFetch && !this.props.didFetch) ||
      (prevProps.didFetchSettings && !this.props.didFetchSettings) ||
      (!prevProps.isShowingLinkIdsNull && this.props.isShowingLinkIdsNull)
    ) this.props.fetch();
  }

  componentWillUnmount() {
    this.props.endIapConnection();
  }

  getColumnWidth = (safeAreaWidth) => {
    let columnWidth = PC_100;
    if (safeAreaWidth >= toPx(SM_WIDTH)) columnWidth = PC_50;
    if (safeAreaWidth >= toPx(LG_WIDTH)) columnWidth = PC_33;

    return columnWidth;
  };

  mkDirAndFetch = async () => {
    try {
      const doExist = await fileApi.exists(IMAGES);
      if (!doExist) await fileApi.mkdir(IMAGES);
    } catch (error) {
      console.log('Can\'t make images dir with error: ', error);
    }

    this.props.fetch();
  };

  render() {
    const { layoutType, safeAreaWidth } = this.props;

    const columnWidth = this.getColumnWidth(safeAreaWidth);
    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ?
      SHOW_COMMANDS : SHOW_BLANK;

    // In Settings, remove a list that makes listName change to MY_LIST
    //   and if not rehydrated yet, loading is shown
    //   so if not rehydrated, show loading under Settings.
    return (
      <React.Fragment>
        <TopBarMain rightPane={topBarRightPane} scrollY={this.scrollY} />
        {layoutType === LAYOUT_LIST ?
          <ListPanel columnWidth={columnWidth} scrollY={this.scrollY} /> :
          <CardPanel columnWidth={columnWidth} scrollY={this.scrollY} />
        }
        <LockPanel columnWidth={columnWidth} />
        {columnWidth === PC_100 && <>
          <BottomBarSearchPopup />
          <BottomBar />
        </>}
        <FetchedPopup />
        {columnWidth !== PC_100 && <>
          <TopBarAddPopup />
          <TopBarProfilePopup />
        </>}
        {columnWidth === PC_100 && <>
          <BottomBarAddPopup />
          <BottomBarProfilePopup />
        </>}
        <CardItemMenuPopup />
        <PinMenuPopup />
        <BulkEditMenuPopup />
        <CustomEditorPopup />
        <TagEditorPopup />
        <GlobalPopups />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    queryString: state.display.queryString,
    didFetch: state.display.didFetch,
    didFetchSettings: state.display.didFetchSettings,
    isShowingLinkIdsNull: getIsShowingLinkIdsNull(state),
    layoutType: getLayoutType(state),
  };
};

const mapDispatchToProps = { fetch, endIapConnection };

export default connect(mapStateToProps, mapDispatchToProps)(withSafeAreaContext(Main));

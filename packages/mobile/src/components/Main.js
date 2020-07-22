import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import {
  fetch, fetchMore, changeListName,
} from '../actions';
import {
  ADD_POPUP,
  PC_100, PC_50, PC_33,
  MY_LIST, TRASH,
  SHOW_BLANK, SHOW_COMMANDS,
  BAR_HEIGHT,
} from '../types/const';
import { getListNames, getLinks } from '../selectors';
import { toPx, multiplyPercent } from '../utils';
import tailwind from 'tailwind-rn';

import Loading from './Loading';
//import TopBar from './TopBar';
//import BottomBar from './BottomBar';
import CardItem from './CardItem';
//import StatusPopup from './StatusPopup';

import emptyBox from '../images/empty-box-sided.svg';
import undrawLink from '../images/undraw-link.svg';
import saveLinkAtUrlBar from '../images/save-link-at-url-bar.svg';

const MAIN_HEAD = 'MAIN_HEAD';
const MAIN_BODY = 'MAIN_BODY';
const MAIN_FOOTER = 'MAIN_FOOTER';

class Main extends React.Component {

  fetched = [];

  componentDidMount() {
    this.props.fetch(true, true);
    this.fetched.push(this.props.listName);
  }

  getColumnWidth = (windowWidth) => {
    let columnWidth = PC_100;
    if (windowWidth >= 640) columnWidth = PC_50;
    if (windowWidth >= 1024) columnWidth = PC_33;

    return columnWidth;
  }

  onListNamePopupClick = (...e) => {
    console.log(e);
    /*const newListName = e.target.getAttribute('data-key');
    if (!newListName) return;

    this.props.changeListName(newListName, this.fetched);
    this.fetched.push(newListName);

    this.props.updatePopup(LIST_NAME_POPUP, false);*/
    return true;
  };

  onAddBtnClick = () => {
    if (this.props.isAddPopupShown) return;

    this.props.updatePopup(ADD_POPUP, true);
  }

  onFetchMoreBtnClick = () => {
    this.props.fetchMore();
  };

  renderListName = () => {

    const { listName, listNames, windowHeight } = this.props;

    return (
      <Menu>
        <MenuTrigger text={listName} />
        <MenuOptions>
          <ScrollView style={{ maxHeight: windowHeight }}>
            {listNames.map(listName => <MenuOption key={listName} onSelect={this.onListNamePopupClick} text={listName} />)}
          </ScrollView>
        </MenuOptions>
      </Menu>
    );
  }

  renderEmpty = () => {

  }

  renderFetchMoreBtn = () => {
    return (
      <TouchableOpacity onPress={this.onFetchMoreBtnClick}>
        <Text style={tailwind('text-base text-gray-900')}>More</Text>
      </TouchableOpacity>
    );
  }

  renderFetchingMore = () => {
    return (
      <View>
        <Text style={tailwind('text-base text-gray-900')}>Fetching</Text>
      </View>
    );
  }

  renderItem = ({ item }) => {

    const { columnWidth, columnIndex } = item;
    let classNames = '';
    if (columnWidth === PC_100) {
      classNames = 'mb-4';
    } else if (columnWidth === PC_50) {
      if (columnIndex === 0) classNames = 'mr-3';
      else if (columnIndex === 1) classNames = 'ml-3';
      else throw new Error(`Invalid columnIndex: ${columnIndex}`);

      classNames += ' mb-6';
    } else if (columnWidth === PC_33) {
      if (columnIndex === 0) classNames = 'mr-6';
      else if (columnIndex === 1) classNames = 'mr-3 ml-3';
      else if (columnIndex === 2) classNames = 'ml-6';
      else throw new Error(`Invalid columnIndex: ${columnIndex}`);

      classNames += ' mb-9';
    }

    return <CardItem style={tailwind(classNames)} link={item.data} />;
  }

  renderColumn = ({ item }) => {

    const { windowWidth } = this.props;
    const columnWidth = this.getColumnWidth(windowWidth);
    const width = Math.floor(multiplyPercent(windowWidth, columnWidth));

    return (
      <FlatList
        style={{ width }}
        data={item.data}
        keyExtractor={item => item.id}
        renderItem={this.renderItem} />
    );
  }

  renderMain = ({ item }) => {

    const { isFetchingMore } = this.props;

    if (item.id === MAIN_HEAD) return this.renderListName();

    if (item.id === MAIN_BODY) {

      const { links, windowWidth } = this.props;
      const columnWidth = this.getColumnWidth(windowWidth);

      const colData = [];
      if (columnWidth === PC_100) {
        let colItems = links.map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 0 };
        });
        colData.push({ id: 'col-0', data: colItems });
      } else if (columnWidth === PC_50) {
        let colItems = links.filter((_, i) => i % 2 === 0).map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 0 };
        });
        colData.push({ id: 'col-0', data: colItems });

        colItems = links.filter((_, i) => i % 2 === 1).map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 1 };
        });
        colData.push({ id: 'col-1', data: colItems });
      } else if (columnWidth === PC_33) {
        let colItems = links.filter((_, i) => i % 3 === 0).map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 0 };
        });
        colData.push({ id: 'col-0', data: colItems });

        colItems = links.filter((_, i) => i % 3 === 1).map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 1 };
        });
        colData.push({ id: 'col-1', data: colItems });

        colItems = links.filter((_, i) => i % 3 === 2).map(link => {
          return { id: link.id, data: link, columnWidth, columnIndex: 2 };
        });
        colData.push({ id: 'col-2', data: colItems });
      } else {
        throw new Error(`Invalid columnWidth: ${columnWidth}`);
      }

      return (
        <FlatList
          style={tailwind('flex-row')}
          data={colData}
          keyExtractor={item => item.id}
          renderItem={this.renderColumn} />
      );
    }

    if (item.id === MAIN_FOOTER) {
      return isFetchingMore ? this.renderFetchingMore() : this.renderFetchMoreBtn();
    }

    throw new Error(`Invalid item.id: ${item.id}`);
  }

  render() {

    const { links, hasMoreLinks } = this.props;

    if (links === null) {
      return <Loading />;
    }

    const mainData = [
      { id: MAIN_HEAD },
      { id: MAIN_BODY },
    ];
    if (hasMoreLinks) mainData.push({ id: MAIN_FOOTER });

    return (
      <React.Fragment>
        <FlatList
          contentContainerStyle={{ paddingBottom: toPx(BAR_HEIGHT) }}
          data={mainData}
          keyExtractor={item => item.id}
          renderItem={this.renderMain} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, props) => {

  const listName = state.display.listName;
  const { links } = getLinks(state);

  return {
    listName: listName,
    listNames: getListNames(state),
    links: links,
    hasMoreLinks: state.hasMoreLinks[listName],
    isFetchingMore: state.display.isFetchingMore,
    searchString: state.display.searchString,
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  fetch, fetchMore, changeListName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);

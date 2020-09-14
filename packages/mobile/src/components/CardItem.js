import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView, View, TouchableOpacity, Linking, LayoutAnimation,
} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Svg, { Path } from 'react-native-svg'
import Clipboard from '@react-native-community/clipboard'

import {
  updatePopup, retryDiedLinks, cancelDiedLinks,
  moveLinks,
} from '../actions';
import {
  DOMAIN_NAME,
  MY_LIST, TRASH,
  ADDING, MOVING,
  OPEN, COPY_LINK, ARCHIVE, REMOVE, RESTORE, DELETE, MOVE_TO,
  CARD_ITEM_POPUP_MENU, CONFIRM_DELETE_POPUP,
  COLOR, PATTERN, IMAGE,
  SM_WIDTH,
} from '../types/const';
import { getListNames } from '../selectors';
import {
  ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  isDiedStatus, extractUrl,
} from '../utils';
import { PATTERN_MAP } from '../types/patternPaths';
import { tailwind } from '../stylesheets/tailwind';
import { cardItemAnimConfig } from '../types/animConfigs';

import { InterText as Text } from '.';
import GracefulImage from './GracefulImage';
import MenuPopupRenderer from './MenuPopupRenderer';

const prependDomainName = (/** @type string */ value) => {
  if (value.startsWith('data:')) return value;
  return DOMAIN_NAME + value;
};

class CardItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      extractedFaviconError: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.link.extractedResult !== nextProps.link.extractedResult ||
      this.props.link.status !== nextProps.link.status ||
      this.props.style !== nextProps.style ||
      this.props.windowWidth !== nextProps.windowWidth ||
      this.props.windowHeight !== nextProps.windowHeight ||
      this.state.extractedFaviconError !== nextState.extractedFaviconError
    ) {
      return true;
    }

    return false;
  }

  populateMenu() {
    const { link, listName, listNames } = this.props;

    let menu = null;
    if (listName in CARD_ITEM_POPUP_MENU) {
      menu = CARD_ITEM_POPUP_MENU[listName];
    } else {
      menu = CARD_ITEM_POPUP_MENU[MY_LIST];
    }
    if ([ADDING, MOVING].includes(link.status)) {
      menu = menu.slice(0, 2);
    }

    const moveTo = [];
    if (menu.includes(MOVE_TO)) {
      for (const name of listNames) {
        if ([TRASH, ARCHIVE].includes(name)) continue;
        if (listName === name) continue;

        moveTo.push(name);
      }
    }

    menu = menu.filter(text => text !== MOVE_TO);

    return { menu, moveTo };
  }

  onMenuBtnClick = () => {
    this.props.updatePopup(this.props.link.id, true, null);
  }

  onMenuPopupClick = (text) => {

    if (text) {
      const { id, url } = this.props.link;
      const { windowWidth } = this.props;
      const animConfig = cardItemAnimConfig(windowWidth);

      if (text === OPEN) {
        Linking.openURL(ensureContainUrlProtocol(url));
      } else if (text === COPY_LINK) {
        Clipboard.setString(url);
      } else if (text === ARCHIVE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(ARCHIVE, [id]);
      } else if (text === REMOVE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(TRASH, [id]);
      } else if (text === RESTORE) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(MY_LIST, [id]);
      } else if (text.startsWith(MOVE_TO)) {
        LayoutAnimation.configureNext(animConfig);
        this.props.moveLinks(text.substring(MOVE_TO.length + 1), [id]);
      } else if (text === DELETE) {
        this.props.updatePopup(CONFIRM_DELETE_POPUP, true);
        return false;
      } else {
        throw new Error(`Invalid text: ${text}`);
      }
    }

    this.props.updatePopup(this.props.link.id, false);
    return true;
  }

  onMenuBackdropPress = () => {
    this.props.updatePopup(this.props.link.id, false);
  }

  onRetryRetryBtnClick = () => {
    this.props.retryDiedLinks([this.props.link.id]);
  }

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  }

  onExtractedFaviconError = () => {
    this.setState({ extractedFaviconError: true });
  }

  renderMenu() {
    const { menu: _menu, moveTo: _moveTo } = this.populateMenu();

    let moveTo = null;
    if (_moveTo && _moveTo.length) {
      moveTo = (
        <React.Fragment>
          <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{MOVE_TO}</Text>
          {_moveTo.map(text => {
            const key = MOVE_TO + ' ' + text;
            return (
              <MenuOption key={key} onSelect={() => this.onMenuPopupClick(key)} customStyles={{ optionWrapper: { padding: 0 } }}>
                <Text style={tailwind('py-2 pl-6 pr-4 text-gray-800')}>{text}</Text>
              </MenuOption>
            );
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {_menu.map(text => {
          return (
            <MenuOption key={text} onSelect={() => this.onMenuPopupClick(text)} customStyles={{ optionWrapper: { padding: 0 } }}>
              <Text style={tailwind('py-2 pl-4 pr-4 text-gray-800')}>{text}</Text>
            </MenuOption>
          );
        })}
        {moveTo && moveTo}
      </React.Fragment>
    );
  }

  renderBusy() {

    const triangleStyle = {
      transform: [{ 'translateX': 32 }, { 'translateY': -32 }, { 'rotate': '45deg' }],
    };
    const svgStyle = {
      top: 66,
      left: 34,
      transform: [{ 'translateX': -12 }, { 'translateY': -24 }, { 'rotate': '-45deg' }],
    };

    return (
      <View style={tailwind('absolute top-0 right-0 w-16 h-16 bg-transparent overflow-hidden')}>
        <View style={[tailwind('w-16 h-16 bg-white overflow-hidden'), triangleStyle]}>
          <Svg style={[tailwind('w-6 h-6 text-gray-900'), svgStyle]} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M19.479 10.092C19.267 6.141 16.006 3 12 3s-7.267 3.141-7.479 7.092A5.499 5.499 0 005.5 21h13a5.499 5.499 0 00.979-10.908zM18.5 19h-13C3.57 19 2 17.43 2 15.5c0-2.797 2.479-3.833 4.433-3.72C6.266 7.562 8.641 5 12 5c3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5zm-4.151-2h-2.77l3-3h2.77l-3 3zm-4.697-3h2.806l-3 3H6.652l3-3zM20 15.5a1.5 1.5 0 01-1.5 1.5h-2.03l2.788-2.788c.442.261.742.737.742 1.288zm-16 0A1.5 1.5 0 015.5 14h2.031l-2.788 2.788A1.495 1.495 0 014 15.5z" />
          </Svg>
        </View>
      </View>
    );
  }

  renderRetry() {
    let { url } = this.props.link;

    return (
      <React.Fragment>
        <View style={tailwind('absolute inset-0 bg-black opacity-75')}></View>
        <View style={tailwind('px-4 absolute inset-0 justify-center items-center bg-transparent')}>
          <Text style={tailwind('text-2xl text-white font-medium text-center')}>Oops..., something went wrong!</Text>
          <View style={tailwind('pt-4 flex-row justify-center items-center')}>
            <TouchableOpacity onPress={this.onRetryRetryBtnClick}>
              <View style={tailwind('px-4 py-1 bg-white border border-white rounded-full')}>
                <Text style={tailwind('text-base text-gray-900 font-semibold text-center')}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onRetryCancelBtnClick}>
              <View style={tailwind('ml-4 px-3 py-1 border border-white rounded-full')}>
                <Text style={tailwind('text-base text-white font-semibold text-center')}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind('mt-10 text-base text-white font-medium text-center')}>Go to the link</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }

  renderImage() {

    const { decor, extractedResult } = this.props.link;

    let image;
    if (extractedResult && extractedResult.image) image = extractedResult.image;

    if (image) {
      return (
        <GracefulImage key="image-graceful-image-extracted-result" style={tailwind('w-full aspect-7/12')} source={{ uri: image }} />
      );
    }

    let fg = null;
    if (decor.image.fg) {
      const { text } = decor.image.fg;
      fg = (
        <React.Fragment>
          <View style={tailwind('items-center justify-center w-20 h-20 bg-white rounded-full')}>
            <Text style={tailwind('text-5xl text-gray-700 font-semibold uppercase')}>{text}</Text>
          </View>
        </React.Fragment>
      );
    }

    // Only plain color background or plain color background with a letter
    if (decor.image.bg.type === COLOR) {
      return (
        <React.Fragment>
          <View style={tailwind(`items-center justify-center w-full aspect-7/12 ${decor.image.bg.value}`)}>
            {fg}
          </View>
        </React.Fragment>
      );
    }

    // Only pattern background or pattern background with a big letter
    if (decor.image.bg.type === PATTERN) {
      return (
        <View style={tailwind('items-center justify-center w-full aspect-7/12')}>
          <GracefulImage key="image-graceful-image-pattern" style={tailwind('absolute inset-0')} source={PATTERN_MAP[decor.image.bg.value]} />
          {fg}
        </View>
      );
    }

    // Random image
    if (decor.image.bg.type === IMAGE) {
      return (
        <GracefulImage key="image-graceful-image-decor" style={tailwind('w-full aspect-7/12')} source={{ uri: prependDomainName(decor.image.bg.value) }} />
      );
    }

    throw new Error(`Invalid decor: ${JSON.stringify(decor)}`);
  }

  renderFavicon() {

    const placeholder = () => {
      if (decor.favicon.bg.type === COLOR) {
        return <View style={tailwind(`flex-shrink-0 flex-grow-0 w-4 h-4 ${decor.favicon.bg.value} rounded-full`)}></View>;
      }

      if (decor.favicon.bg.type === PATTERN) {
        return (
          <GracefulImage key="favicon-graceful-image-pattern" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4 rounded-full')} source={PATTERN_MAP[decor.favicon.bg.value]} />
        );
      }
    };

    const { url, decor, extractedResult } = this.props.link;
    const { extractedFaviconError } = this.state;

    let favicon;
    if (extractedResult && extractedResult.favicon) {
      favicon = ensureContainUrlSecureProtocol(extractedResult.favicon);
    }

    if (favicon && !extractedFaviconError) {
      return <GracefulImage key="favicon-graceful-image-extracted-result" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={{ uri: favicon }} customPlaceholder={placeholder} onError={this.onExtractedFaviconError} />;
    }

    const { origin } = extractUrl(url);
    favicon = ensureContainUrlSecureProtocol(origin) + '/favicon.ico';

    return <GracefulImage key="favicon-graceful-image-ico" style={tailwind('flex-shrink-0 flex-grow-0 w-4 h-4')} source={{ uri: favicon }} customPlaceholder={placeholder} />;
  }

  render() {
    const { style, windowWidth, windowHeight } = this.props;
    const { url, status, extractedResult } = this.props.link;

    // Need to do this as React Native doesn't support maxWidth: "none"
    //   even though it's in tailwind-rn.
    const viewStyle = windowWidth < SM_WIDTH ? 'max-w-sm' : '';

    let title, classNames = '';
    if (extractedResult && extractedResult.title) {
      title = extractedResult.title;
      classNames = 'text-justify';
    }
    if (!title) {
      title = url;
    }

    const { host, origin } = extractUrl(url);

    return (
      <View style={style}>
        <View style={tailwind(`self-center bg-white rounded-lg shadow-sm overflow-hidden ${viewStyle}`)}>
          {this.renderImage()}
          <View style={tailwind('flex-row justify-between items-center w-full')}>
            <View style={tailwind('pl-4 flex-shrink flex-grow flex-row items-center lg:pl-5', windowWidth)}>
              {this.renderFavicon()}
              <View style={tailwind('flex-shrink flex-grow')}>
                <TouchableOpacity onPress={() => Linking.openURL(origin)}>
                  <Text style={tailwind('pl-2 text-base text-gray-700')} numberOfLines={1} ellipsizeMode="tail">{host}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* value of triggerOffsets needs to be aligned with paddings of the three dots */}
            <Menu renderer={MenuPopupRenderer} rendererProps={{ triggerOffsets: { x: 8, y: (16 - 4), width: -1 * (16 + 8 - 4), height: -6 }, popupStyle: tailwind('py-2 min-w-32 border border-gray-200 rounded-lg shadow-xl') }} onOpen={this.onMenuBtnClick} onBackdropPress={this.onMenuBackdropPress}>
              <MenuTrigger>
                {/* View with paddingBottom is required because there is this space on the web. */}
                <View style={{ paddingBottom: 6 }}>
                  {/* Change the paddings here, need to change triggerOffsets too */}
                  <View style={tailwind('pt-2 pb-0 pl-4 pr-2 flex-shrink-0 flex-grow-0')}>
                    <Svg style={tailwind('py-2 w-6 h-10 text-gray-700 rounded-full')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <Path d="M12 5v.01V5zm0 7v.01V12zm0 7v.01V19zm0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                </View>
              </MenuTrigger>
              <MenuOptions>
                <ScrollView style={{ maxHeight: windowHeight }}>
                  {this.renderMenu()}
                </ScrollView>
              </MenuOptions>
            </Menu>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(ensureContainUrlProtocol(url))}>
            <Text style={tailwind(`mt-0 mb-3 ml-4 mr-3 text-base text-gray-800 font-semibold leading-6.5 ${classNames} lg:mb-4 lg:ml-5 lg:mr-4`, windowWidth)}>{title}</Text>
          </TouchableOpacity>
          {isDiedStatus(status) && this.renderRetry()}
          {[ADDING, MOVING].includes(status) && this.renderBusy()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listName: state.display.listName,
    listNames: getListNames(state),
    windowWidth: state.window.width,
    windowHeight: state.window.height,
  };
};

const mapDispatchToProps = {
  updatePopup, retryDiedLinks, cancelDiedLinks,
  moveLinks,
};

export default connect(mapStateToProps, mapDispatchToProps)(CardItem);

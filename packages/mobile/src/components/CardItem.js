import React from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import {
  updatePopup, retryDiedLinks, cancelDiedLinks,
} from '../actions';
import {
  ensureContainUrlProtocol, ensureContainUrlSecureProtocol,
  isDiedStatus, extractUrl,
} from '../utils';
import {
  ADDING, MOVING,
  COLOR, PATTERN, IMAGE,
} from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

class CardItem extends React.Component {

  onMenuBtnClick = () => {
    this.props.updatePopup(this.props.link.id, true, null);
  }

  onRetryRetryBtnClick = () => {
    this.props.retryDiedLinks([this.props.link.id]);
  }

  onRetryCancelBtnClick = () => {
    this.props.cancelDiedLinks([this.props.link.id]);
  }

  renderBusy() {

  }

  renderRetry() {

  }

  renderImage() {

  }

  renderFavicon() {

  }

  render() {
    const { url, status, extractedResult } = this.props.link;

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
      <View>
        <Text>{title}</Text>
      </View>
    );
  }
}

export default connect(null, { updatePopup, retryDiedLinks, cancelDiedLinks })(CardItem);

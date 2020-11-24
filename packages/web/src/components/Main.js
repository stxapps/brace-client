import React from 'react';
import { connect } from 'react-redux';

import { updateHistoryPosition } from '../actions';
import {
  BACK_DECIDER, BACK_POPUP,
  PC_100, PC_50, PC_33,
  SHOW_BLANK, SHOW_COMMANDS,
  SM_WIDTH, LG_WIDTH,
} from '../types/const';
import { getLinks } from '../selectors';
import { throttle } from '../utils';

import Loading from './Loading';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import CardPanel from './CardPanel';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import SettingsPopup from './SettingsPopup';

class Main extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      columnWidth: this.getColumnWidth(),
    };

    // BUG alert
    // When delete all data, fetched is not cleared!
    this.fetched = [];

    this.updateColumnWidth = throttle(this.updateColumnWidth, 16);
  }

  componentDidMount() {

    if (window.history.state === null) {
      this.props.updateHistoryPosition(BACK_POPUP);

      window.history.replaceState(BACK_DECIDER, '', window.location.href);
      window.history.pushState(BACK_POPUP, '', window.location.href);
    }

    window.addEventListener('resize', this.updateColumnWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateColumnWidth);
  }

  getColumnWidth = () => {
    let columnWidth = PC_100;
    if (window.innerWidth >= SM_WIDTH) columnWidth = PC_50;
    if (window.innerWidth >= LG_WIDTH) columnWidth = PC_33;

    return columnWidth;
  }

  updateColumnWidth = () => {
    this.setState({ columnWidth: this.getColumnWidth() });
  }

  render() {

    const { links } = this.props;
    const { columnWidth } = this.state;

    if (links === null) {
      return <Loading />;
    }

    const topBarRightPane = [PC_50, PC_33].includes(columnWidth) ? SHOW_COMMANDS : SHOW_BLANK;

    return (
      <React.Fragment>
        <CardPanel columnWidth={columnWidth} fetched={this.fetched} />
        <TopBar rightPane={topBarRightPane} isListNameShown={true} fetched={this.fetched} />
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
  };
};

const mapDispatchToProps = { updateHistoryPosition };

export default connect(mapStateToProps, mapDispatchToProps)(Main);

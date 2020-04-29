import React from 'react';
import { connect } from 'react-redux';

import { addLink, searchLinks, signOut, updatePopup } from '../actions';

class TopBar extends React.Component {

  state = {
    isAddPopupShown: false,
    url: '',
    msg: '',
  }

  validateUrl(url) {
    if (!url) {
      return [false, 'Please fill in a link you want to save in the textbox.'];
    }

    return [true, ''];
  }

  onAddBtnClick = () => {
    this.setState({
      isAddPopupShown: true,
    });
  };

  onSaveBtnClick = () => {
    const [isValid, msg] = this.validateUrl(this.state.url);
    if (!isValid) {
      this.setState({ msg: msg });
      return;
    }

    this.props.addLink(this.state.url);
    this.setState({
      isAddPopupShown: false,
      url: '',
      msg: '',
    });
  };

  onCancelBtnClick = () => {
    this.setState({
      isAddPopupShown: false,
      msg: '',
    });
  };

  render() {

    let addPopup;
    if (this.state.isAddPopupShown) {
      addPopup = (
        <div>
          <input
            type="text"
            placeholder="http://"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })} />
          <button onClick={this.onSaveBtnClick}>Save</button>
          <button onClick={this.onCancelBtnClick}>Cancel</button>
          <p className="text-red-500">{this.state.msg}</p>
        </div>
      );
    }

    return (
      <React.Fragment>
        <button onClick={() => this.props.signOut()}>Sign out</button>
        <div className="p-3">
          <button onClick={this.onAddBtnClick}>Add a new link</button>
        </div>
        {addPopup}
      </React.Fragment >
    );
  }
}

const mapStateToProps = null;

export default connect(mapStateToProps, { addLink, searchLinks, signOut, updatePopup })(TopBar);

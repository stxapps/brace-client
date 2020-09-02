import React from 'react';
import { connect } from 'react-redux';

import { default as Loading } from './TranslucentLoading';
import { default as Adding} from './TranslucentAdding';

class Share extends React.PureComponent {

  render() {

    if (this.props.href === null) {
      return <Loading />;
    }

    return <Adding />;
  }
}

const mapStateToProps = (state) => {
  return {
    href: state.window.href,
  };
};

export default connect(mapStateToProps)(Share);

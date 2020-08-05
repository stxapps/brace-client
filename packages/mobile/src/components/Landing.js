import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { InterText as Text } from '.';

import { signUp } from '../actions';
import { SHOW_SIGN_IN } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

import TopBar from './TopBar';

class Landing extends React.PureComponent {

  render() {
    const { windowWidth } = this.props;

    return (
      <React.Fragment>
        <TopBar rightPane={SHOW_SIGN_IN} />
        <View style={styles.container}>
          <Text style={tailwind('text-gray-900 text-lg font-semibold sm:text-yellow-600', windowWidth)}>
            Hello World!
          </Text>
          <TouchableOpacity onPress={() => this.props.signUp()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    alignItems: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  }
});

const mapStateToProps = (state) => {
  return {
    windowWidth: state.window.width,
  };
};

export default connect(mapStateToProps, { signUp })(Landing);

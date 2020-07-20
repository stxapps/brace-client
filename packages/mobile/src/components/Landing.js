import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { InterText as Text } from '.';

import { signUp, signIn } from '../actions';
import { tailwind } from '../stylesheets/tailwind';

class Landing extends React.Component {

  render() {
    const { windowWidth } = this.props;

    return (
      <View style={styles.container}>
        <Text style={tailwind('text-gray-900 text-lg font-semibold sm:text-yellow-600', windowWidth)}>
          Hello World!
        </Text>
        <TouchableOpacity onPress={() => this.props.signIn()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.signUp()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </View>
        </TouchableOpacity>
      </View>
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

export default connect(mapStateToProps, { signUp, signIn })(Landing);

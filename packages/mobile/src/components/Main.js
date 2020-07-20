import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { signOut } from '../actions';

class Main extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Hello World! This is main!
        </Text>
        <TouchableOpacity onPress={() => this.props.signOut()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Sign out</Text>
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

export default connect(null, { signOut })(Main);

import React from 'react';
import { View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateSearchString } from '../actions';
import { getThemeMode } from '../selectors';

import { withTailwind } from '.';

class TopBarSearchInput extends React.PureComponent {

  onSearchInputChange = (e) => {
    this.props.updateSearchString(e.nativeEvent.text);
  }

  onSearchClearBtnClick = () => {
    this.props.updateSearchString('');
  }

  render() {
    const { searchString, tailwind } = this.props;

    const inputClassNames = Platform.OS === 'ios' ? 'py-2 leading-4' : 'py-0.5';
    const searchClearBtnClasses = searchString.length === 0 ? 'hidden relative' : 'flex absolute';

    return (
      <View style={tailwind('ml-4 w-48')}>
        <TextInput onChange={this.onSearchInputChange} style={tailwind(`ml-0.5 w-full rounded-full border border-transparent bg-gray-100 pl-9 pr-6 text-sm font-normal text-gray-700 ${inputClassNames}`)} placeholder="Search" placeholderTextColor="rgb(107, 114, 128)" value={searchString} autoCapitalize="none" />
        {/* A bug display: none doesn't work with absolute, need to change to relative. https://github.com/facebook/react-native/issues/18415 */}
        <TouchableOpacity onPress={this.onSearchClearBtnClick} style={tailwind(`inset-y-0 right-0 items-center justify-center pr-2 ${searchClearBtnClasses}`)}>
          <Svg style={tailwind('rounded-full font-normal text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" />
          </Svg>
        </TouchableOpacity>
        <View style={tailwind('absolute inset-y-0 left-0 justify-center pl-3')}>
          <Svg style={tailwind('font-normal text-gray-400')} width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
            <Path d="M16.32 14.9l1.1 1.1c.4-.02.83.13 1.14.44l3 3a1.5 1.5 0 0 1-2.12 2.12l-3-3a1.5 1.5 0 0 1-.44-1.14l-1.1-1.1a8 8 0 1 1 1.41-1.41l.01-.01zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          </Svg>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    searchString: state.display.searchString,
    themeMode: getThemeMode(state),
  };
};

const mapDispatchToProps = { updateSearchString };

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(TopBarSearchInput));

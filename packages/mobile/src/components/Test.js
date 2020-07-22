import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, Button, ScrollView } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { tailwind } from '../stylesheets/tailwind';

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const platform = Platform.OS;
console.log(deviceWidth, deviceHeight, platform)

const testData1 = [
  {
    id: '1-1',
    text: 'Etiam vel neque nec dui dignissim bibendum.'
  },
  {
    id: '1-2',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '1-3',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
  },
  {
    id: '1-4',
    text: 'Curabitur lacinia pulvinar nibh.'
  },
  {
    id: '1-5',
    text: 'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.'
  },
  {
    id: '1-6',
    text: 'Cras placerat accumsan nulla. Sed id ligula quis est convallis tempor.'
  },
  {
    id: '1-7',
    text: 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-8',
    text: 'Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Phasellus purus.'
  },
  {
    id: '1-9',
    text: 'Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.'
  },
  {
    id: '1-10',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-11',
    text: 'Etiam vel neque nec dui dignissim bibendum.'
  },
  {
    id: '1-12',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '1-13',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
  },
  {
    id: '1-14',
    text: 'Curabitur lacinia pulvinar nibh.'
  },
  {
    id: '1-15',
    text: 'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.'
  },
  {
    id: '1-16',
    text: 'Cras placerat accumsan nulla. Sed id ligula quis est convallis tempor.'
  },
  {
    id: '1-17',
    text: 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-18',
    text: 'Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Phasellus purus.'
  },
  {
    id: '1-19',
    text: 'Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.'
  },
  {
    id: '1-20',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-21',
    text: 'Etiam vel neque nec dui dignissim bibendum.'
  },
  {
    id: '1-22',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '1-23',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
  },
  {
    id: '1-24',
    text: 'Curabitur lacinia pulvinar nibh.'
  },
  {
    id: '1-25',
    text: 'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.'
  },
  {
    id: '1-26',
    text: 'Cras placerat accumsan nulla. Sed id ligula quis est convallis tempor.'
  },
  {
    id: '1-27',
    text: 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-28',
    text: 'Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Phasellus purus.'
  },
  {
    id: '1-29',
    text: 'Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.'
  },
  {
    id: '1-30',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-31',
    text: 'Etiam vel neque nec dui dignissim bibendum.'
  },
  {
    id: '1-32',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '1-33',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
  },
  {
    id: '1-34',
    text: 'Curabitur lacinia pulvinar nibh.'
  },
  {
    id: '1-35',
    text: 'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.'
  },
  {
    id: '1-36',
    text: 'Cras placerat accumsan nulla. Sed id ligula quis est convallis tempor.'
  },
  {
    id: '1-37',
    text: 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-38',
    text: 'Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Phasellus purus.'
  },
  {
    id: '1-39',
    text: 'Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.'
  },
  {
    id: '1-40',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-41',
    text: 'Etiam vel neque nec dui dignissim bibendum.'
  },
  {
    id: '1-42',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '1-43',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
  },
  {
    id: '1-44',
    text: 'Curabitur lacinia pulvinar nibh.'
  },
  {
    id: '1-45',
    text: 'Aliquam erat volutpat.  Nunc eleifend leo vitae magna.  In id erat non orci commodo lobortis.  Proin neque massa, cursus ut, gravida ut, lobortis eget, lacus.  Sed diam.  Praesent fermentum tempor tellus.  Nullam tempus.  Mauris ac felis vel velit tristique imperdiet.  Donec at pede.  Etiam vel neque nec dui dignissim bibendum.  Vivamus id enim.  Phasellus neque orci, porta a, aliquet quis, semper a, massa.  Phasellus purus.  Pellentesque tristique imperdiet tortor.  Nam euismod tellus id erat.'
  },
  {
    id: '1-46',
    text: 'Cras placerat accumsan nulla. Sed id ligula quis est convallis tempor.'
  },
  {
    id: '1-47',
    text: 'Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
  {
    id: '1-48',
    text: 'Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio. Phasellus purus.'
  },
  {
    id: '1-49',
    text: 'Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.'
  },
  {
    id: '1-50',
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.'
  },
];

const testData2 = [
  {
    id: '2-1',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.'
  },
  {
    id: '2-2',
    text: 'Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.'
  },
  {
    id: '2-3',
    text: 'Pellentesque dapibus suscipit ligula.  Donec posuere augue in quam.  Etiam vel tortor sodales tellus ultricies commodo.  Suspendisse potenti.  Aenean in sem ac leo mollis blandit.  Donec neque quam, dignissim in, mollis nec, sagittis eu, wisi.  Phasellus lacus.  Etiam laoreet quam sed arcu.'
  },
];

const colData = [
  {
    id: 'col-1',
    data: testData1,
  },
  {
    id: 'col-2',
    data: testData2,
  },
];

const mainData = [
  {
    id: 'header',
  },
  {
    id: 'items',
  },
  {
    id: 'footer',
  }
];

class Test extends React.Component {

  state = {
    isListNamePopupShown: false,
  };

  onListNameBtnClick = () => {
    console.log(`onListNameBtnClick`);
    this.setState({ isListNamePopupShown: !this.state.isListNamePopupShown });
  }

  onMoreBtnClick = () => {
    console.log(`onMoreBtnClick`);
  }

  renderHeader = () => {
    return (
      <Menu>
        <MenuTrigger text='My List' />
        <MenuOptions>
          <ScrollView style={{ maxHeight: 300 }}>
            <MenuOption onSelect={() => alert(`Save`)} text='My List' />
            <MenuOption onSelect={() => alert(`Save`)} text='Archive' />
            <MenuOption onSelect={() => alert(`Save`)} text='Trash' />
            <MenuOption onSelect={() => alert(`Save`)} text='My List2' />
            <MenuOption onSelect={() => alert(`Save`)} text='Archive2' />
            <MenuOption onSelect={() => alert(`Save`)} text='Trash2' />
            <MenuOption onSelect={() => alert(`Save`)} text='My List3' />
            <MenuOption onSelect={() => alert(`Save`)} text='Archive3' />
            <MenuOption onSelect={() => alert(`Save`)} text='Trash3' />
            <MenuOption onSelect={() => alert(`Save`)} text='My List4' />
            <MenuOption onSelect={() => alert(`Save`)} text='Archive4' />
            <MenuOption onSelect={() => alert(`Save`)} text='Trash4' />
            <MenuOption onSelect={() => alert(`Save`)} text='My List5' />
            <MenuOption onSelect={() => alert(`Save`)} text='Archive5' />
            <MenuOption onSelect={() => alert(`Save`)} text='Trash5' />
          </ScrollView>
        </MenuOptions>
      </Menu>
    );
  }

  renderFooter = () => {
    return (
      <View style={tailwind('mx-2 my-2 p-2 bg-white')}>
        <TouchableOpacity onPress={this.onMoreBtnClick}>
          <Text style={tailwind('text-lg text-gray-900 font-semibold')}>More</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderItem = ({ item }) => {
    console.log(`Rendering: ${item.id}`)
    return (
      <View style={tailwind('mx-2 my-2 p-2 bg-blue-200')}>
        <Text style={tailwind('text-gray-900')}>{item.text}</Text>
      </View>
    );
  }

  renderCol = ({ item }) => {
    return (
      <FlatList
        style={{ width: Math.floor(deviceWidth / 2) }}
        data={item.data}
        keyExtractor={item => item.id}
        renderItem={this.renderItem} />
    );
  }

  renderHeaderCardsFooter = ({ item }) => {

    if (item.id === 'header') return this.renderHeader();
    else if (item.id === 'items') {
      return (
        <FlatList
          style={tailwind('flex-row')}
          data={colData}
          keyExtractor={item => item.id}
          renderItem={this.renderCol} />
      );
    }
    else if (item.id === 'footer') return this.renderFooter();
    else throw new Error();
  }

  /*render() {
    return (
      <View style={[tailwind('flex-1 bg-green-400')]}>
            <Text>
              Hello World! This is a Test!
        </Text>
            <View style={tailwind('flex-1 flex-row')}>
              <FlatList
                data={testData1}
                keyExtractor={item => item.id}
                renderItem={this.renderItem} />
              <FlatList
                data={testData2}
                keyExtractor={item => item.id}
                renderItem={this.renderItem} />
            </View>
          </View>
          );
        }*/

  render() {
    return (
      <View style={tailwind('flex-1 bg-green-400')}>
        <Text>
          Hello World! This is a Test!
        </Text>
        <FlatList
          data={mainData}
          keyExtractor={item => item.id}
          renderItem={this.renderHeaderCardsFooter} />
      </View >
    );
  }
}

export default Test;

import React from 'react';
import { connect } from 'react-redux';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType,
} from '../actions';
import { HASH_PRIVACY, LAYOUT_CARD, LAYOUT_LIST } from '../types/const';

import { withTailwind } from '.';

class SettingsPopupMisc extends React.PureComponent {

  onDoExtractBtnClick = () => {
    const { doExtractContents } = this.props;
    this.props.updateDoExtractContents(!doExtractContents);
  }

  onDoDeleteBtnClick = () => {
    const { doDeleteOldLinksInTrash } = this.props;
    this.props.updateDoDeleteOldLinksInTrash(!doDeleteOldLinksInTrash);
  }

  onDoDescendingInputChange = (e) => {
    let doDescendingOrder;

    const value = e.target.value;
    if (value === 'ascending') doDescendingOrder = false;
    else if (value === 'descending') doDescendingOrder = true;
    else throw new Error(`Invalid value: ${value}`);

    this.props.updateDoDescendingOrder(doDescendingOrder);
  }

  onLayoutTypeInputChange = (e) => {
    this.props.updateLayoutType(e.target.value);
  }

  render() {
    const {
      doExtractContents, doDeleteOldLinksInTrash, doDescendingOrder, layoutType,
      tailwind,
    } = this.props;

    const doExtractBtnClassNames = doExtractContents ? 'bg-blue-500' : 'bg-gray-200';
    const doExtractBtnInnerClassNames = doExtractContents ? 'translate-x-5' : 'translate-x-0';

    const doDeleteBtnClassNames = doDeleteOldLinksInTrash ? 'bg-blue-500' : 'bg-gray-200';
    const doDeleteBtnInnerClassNames = doDeleteOldLinksInTrash ? 'translate-x-5' : 'translate-x-0';

    const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

    const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

    const layoutCardBtnClassNames = layoutType === LAYOUT_CARD ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const layoutCardBtnInnerClassNames = layoutType === LAYOUT_CARD ? 'text-blue-800' : 'text-gray-600';

    const layoutListBtnClassNames = layoutType === LAYOUT_LIST ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const layoutListBtnInnerClassNames = layoutType === LAYOUT_LIST ? 'text-blue-800' : 'text-gray-600';

    return (
      <div className={tailwind('relative p-4 md:p-6')}>
        <div className={tailwind('border-b border-gray-200 md:hidden')}>
          <button onClick={this.props.onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
            <span className={tailwind('rounded text-sm text-gray-500 group-focus:ring')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
          </button>
          <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800')}>Misc.</h3>
        </div>
        <div className={tailwind('mt-6 flex items-center justify-between space-x-4 md:mt-0')}>
          <div className={tailwind('flex flex-col')}>
            <h4 id="link-previews-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Link Previews</h4>
            <p id="link-previews-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring')} href={'/' + HASH_PRIVACY} target="_blank" rel="noreferrer">our privacy policy page</a>.</p>
          </div>
          <span onClick={this.onDoExtractBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="link-previews-option-label" aria-describedby="link-previews-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring ${doExtractBtnClassNames}`)}>
            <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${doExtractBtnInnerClassNames}`)} />
          </span>
        </div>
        <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
          <div className={tailwind('flex flex-col')}>
            <h4 id="auto-delete-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Auto Cleanup</h4>
            <p id="auto-delete-option-description" className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500')}>Allow old removed links in Trash to be automatically deleted after 45 days.</p>
          </div>
          <span onClick={this.onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring ${doDeleteBtnClassNames}`)}>
            <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${doDeleteBtnInnerClassNames}`)} />
          </span>
        </div>
        <div className={tailwind('mt-10 mb-4 flex flex-col')}>
          <h4 id="list-order-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>List Order</h4>
          <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
            <p id="list-order-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500')}>Choose whether your saved links are sorted by saved date in <span className={tailwind('font-semibold')}>ascending order</span> (links you save first appear first) or <span className={tailwind('font-semibold')}>descending order</span> (links you save last appear first) when you browse your saved links.</p>
            <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
              <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
                <div className={tailwind('flex h-5 items-center')}>
                  <input onChange={this.onDoDescendingInputChange} id="list-order-option-1" name="list-order-option-1" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={!doDescendingOrder} value="ascending" />
                </div>
                <label htmlFor="list-order-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                  <span className={tailwind(`block text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</span>
                </label>
              </div>
              <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                <div className={tailwind('flex h-5 items-center')}>
                  <input onChange={this.onDoDescendingInputChange} id="list-order-option-2" name="list-order-option-2" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={doDescendingOrder} value="descending" />
                </div>
                <label htmlFor="list-order-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                  <span className={tailwind(`block text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className={tailwind('mt-10 mb-4 flex flex-col')}>
          <h4 id="layout-type-option-label" className={tailwind('text-base font-medium leading-none text-gray-800')}>Layout View</h4>
          <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
            <p id="layout-type-option-description" className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500')}>Choose whether your saved links are displayed in Cards view or in List view. This setting is not synced so you can have a different layout for each of your devices.</p>
            <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
              <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${layoutCardBtnClassNames}`)}>
                <div className={tailwind('flex h-5 items-center')}>
                  <input onChange={this.onLayoutTypeInputChange} id="layout-type-option-1" name="layout-type-option-1" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={layoutType === LAYOUT_CARD} value={LAYOUT_CARD} />
                </div>
                <label htmlFor="layout-type-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                  <span className={tailwind(`block text-sm font-medium leading-5 ${layoutCardBtnInnerClassNames}`)}>Cards view</span>
                </label>
              </div>
              <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${layoutListBtnClassNames}`)}>
                <div className={tailwind('flex h-5 items-center')}>
                  <input onChange={this.onLayoutTypeInputChange} id="layout-type-option-2" name="layout-type-option-2" type="radio" className={tailwind('h-4 w-4 cursor-pointer text-blue-600 transition duration-150 ease-in-out focus:ring')} checked={layoutType === LAYOUT_LIST} value={LAYOUT_LIST} />
                </div>
                <label htmlFor="layout-type-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                  <span className={tailwind(`block text-sm font-medium leading-5 ${layoutListBtnInnerClassNames}`)}>List view</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    doExtractContents: state.settings.doExtractContents,
    doDeleteOldLinksInTrash: state.settings.doDeleteOldLinksInTrash,
    doDescendingOrder: state.settings.doDescendingOrder,
    layoutType: state.localSettings.layoutType,
    safeAreaWidth: state.window.width,
  };
};

const mapDispatchToProps = {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
  updateLayoutType,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTailwind(SettingsPopupMisc));

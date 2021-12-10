import React from 'react';
import { connect } from 'react-redux';

import {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
} from '../actions';

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

  render() {

    const { doExtractContents, doDeleteOldLinksInTrash, doDescendingOrder } = this.props;

    const doExtractBtnClassNames = doExtractContents ? 'bg-blue-500' : 'bg-gray-200';
    const doExtractBtnInnerClassNames = doExtractContents ? 'translate-x-5' : 'translate-x-0';

    const doDeleteBtnClassNames = doDeleteOldLinksInTrash ? 'bg-blue-500' : 'bg-gray-200';
    const doDeleteBtnInnerClassNames = doDeleteOldLinksInTrash ? 'translate-x-5' : 'translate-x-0';

    const ascendingBtnClassNames = !doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

    const descendingBtnClassNames = doDescendingOrder ? 'bg-blue-100 border-blue-200 z-10' : 'border-gray-200';
    const descendingBtnInnerClassNames = doDescendingOrder ? 'text-blue-800' : 'text-gray-600';

    return (
      <div className="p-4 relative md:p-6 md:pt-4">
        <div className="border-b border-gray-200 md:hidden">
          <button onClick={this.props.onSidebarOpenBtnClick} className="pb-1 group focus:outline-none">
            <span className="text-sm text-gray-500 rounded group-focus:ring">{'<'} <span className="group-hover:underline">Settings</span></span>
          </button>
          <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Misc.</h3>
        </div>
        <div className="mt-6 flex items-center justify-between space-x-4 md:mt-0">
          <div className="flex flex-col">
            <h4 id="link-previews-option-label" className="text-base text-gray-800 font-medium leading-none">Link Previews</h4>
            <p id="link-previews-option-description" className="mt-2.5 text-base text-gray-500 leading-relaxed">Allow your saved links to be sent to our server for extracting their representative title and image. No your personal information involved at all so there is no way to know who saves what links. These titles and images are used in our website and app for you to easily find and recognize your saved links. For more information, please visit <a className="underline rounded hover:text-gray-700 focus:outline-none focus:ring" href="/#privacy">our privacy policy page</a>.</p>
          </div>
          <span onClick={this.onDoExtractBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="link-previews-option-label" aria-describedby="link-previews-option-description" className={`${doExtractBtnClassNames} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring`}>
            <span aria-hidden="true" className={`${doExtractBtnInnerClassNames} inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200`} />
          </span>
        </div>
        <div className="mt-10 flex items-center justify-between space-x-4">
          <div className="flex flex-col">
            <h4 id="auto-delete-option-label" className="text-base text-gray-800 font-medium leading-none">Auto Cleanup</h4>
            <p id="auto-delete-option-description" className="mt-2.5 text-base text-gray-500 leading-relaxed">Allow old removed links in Trash to be automatically deleted after 45 days</p>
          </div>
          <span onClick={this.onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={`${doDeleteBtnClassNames} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring`}>
            <span aria-hidden="true" className={`${doDeleteBtnInnerClassNames} inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200`} />
          </span>
        </div>
        <div className="mt-10 mb-4 flex flex-col">
          <h4 id="auto-delete-option-label" className="text-base text-gray-800 font-medium leading-none">List Order</h4>
          <div className="sm:flex sm:items-start sm:justify-between sm:space-x-4">
            <p id="auto-delete-option-description" className="mt-2.5 flex-grow flex-shrink text-base text-gray-500 leading-relaxed">Choose whether your saved links are sorted by saved date in <span className="font-semibold">ascending order</span> (links you save first appear first) or <span className="font-semibold">descending order</span> (links you save last appear first) when you browse your saved links.</p>
            <div className="mx-auto mt-2.5 w-full max-w-48 bg-white rounded-md shadow-sm -space-y-px sm:mt-1 sm:flex-grow-0 sm:flex-shrink-0 sm:w-48 sm:max-w-none">
              <div className={`${ascendingBtnClassNames} p-4 relative flex border rounded-tl-md rounded-tr-md`}>
                <div className="flex items-center h-5">
                  <input onChange={this.onDoDescendingInputChange} id="list-order-option-1" name="list-order" type="radio" className="h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer focus:ring" checked={!doDescendingOrder} value="ascending" />
                </div>
                <label htmlFor="list-order-option-1" className="ml-3 flex flex-col cursor-pointer">
                  <span className={`${ascendingBtnInnerClassNames} block text-sm leading-5 font-medium`}>Ascending order</span>
                </label>
              </div>
              <div className={`${descendingBtnClassNames} p-4 flex relative border rounded-bl-md rounded-br-md`}>
                <div className="flex items-center h-5">
                  <input onChange={this.onDoDescendingInputChange} id="list-order-option-2" name="list-order" type="radio" className="h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer focus:ring" checked={doDescendingOrder} value="descending" />
                </div>
                <label htmlFor="list-order-option-2" className="ml-3 flex flex-col cursor-pointer">
                  <span className={`${descendingBtnInnerClassNames} block text-sm leading-5 font-medium`}>Descending order</span>
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
  };
};

const mapDispatchToProps = {
  updateDoExtractContents, updateDoDeleteOldLinksInTrash, updateDoDescendingOrder,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPopupMisc);

import { REHYDRATE } from 'redux-persist/constants';

import {
  UPDATE_LIST_NAME, UPDATE_QUERY_STRING, UPDATE_SEARCH_STRING, UPDATE_POPUP, FETCH,
  FETCH_COMMIT, FETCH_ROLLBACK, UPDATE_FETCHED, FETCH_MORE_ROLLBACK, UPDATE_FETCHED_MORE,
  REFRESH_FETCHED, ADD_FETCHING_INFO, DELETE_FETCHING_INFO, SET_SHOWING_LINK_IDS,
  ADD_LINKS, MOVE_LINKS_DELETE_STEP_COMMIT, DELETE_LINKS_COMMIT, CANCEL_DIED_LINKS,
  DELETE_OLD_LINKS_IN_TRASH, DELETE_OLD_LINKS_IN_TRASH_COMMIT,
  DELETE_OLD_LINKS_IN_TRASH_ROLLBACK, EXTRACT_CONTENTS, EXTRACT_CONTENTS_COMMIT,
  EXTRACT_CONTENTS_ROLLBACK, UPDATE_EXTRACTED_CONTENTS, UPDATE_CUSTOM_DATA,
  UPDATE_STATUS, UPDATE_HANDLING_SIGN_IN, UPDATE_BULK_EDITING, ADD_SELECTED_LINK_IDS,
  DELETE_SELECTED_LINK_IDS, UPDATE_SELECTING_LINK_ID, UPDATE_SELECTING_LIST_NAME,
  DELETE_LIST_NAMES, UPDATE_DELETE_ACTION, UPDATE_DISCARD_ACTION, UPDATE_SETTINGS,
  UPDATE_SETTINGS_COMMIT, UPDATE_SETTINGS_ROLLBACK, CANCEL_DIED_SETTINGS,
  MERGE_SETTINGS_COMMIT, UPDATE_SETTINGS_VIEW_ID, UPDATE_LIST_NAMES_MODE,
  UPDATE_PAYWALL_FEATURE, UPDATE_LOCK_ACTION, ADD_LOCK_LIST, LOCK_LIST,
  UPDATE_LOCKS_FOR_ACTIVE_APP, UPDATE_LOCKS_FOR_INACTIVE_APP,
  UPDATE_TAG_DATA_S_STEP_COMMIT, UPDATE_TAG_DATA_T_STEP_COMMIT,
  UPDATE_SELECTING_TAG_NAME, DELETE_TAG_NAMES, UPDATE_IMPORT_ALL_DATA_PROGRESS,
  UPDATE_EXPORT_ALL_DATA_PROGRESS, UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
  RESET_STATE,
} from '../types/actionTypes';
import {
  ALL, SIGN_UP_POPUP, SIGN_IN_POPUP, ADD_POPUP, SEARCH_POPUP, PROFILE_POPUP,
  CARD_ITEM_MENU_POPUP, LIST_NAMES_POPUP, PIN_MENU_POPUP, CUSTOM_EDITOR_POPUP,
  TAG_EDITOR_POPUP, PAYWALL_POPUP, CONFIRM_DELETE_POPUP, CONFIRM_DISCARD_POPUP,
  SETTINGS_POPUP, SETTINGS_LISTS_MENU_POPUP, SETTINGS_TAGS_MENU_POPUP, TIME_PICK_POPUP,
  LOCK_EDITOR_POPUP, ACCESS_ERROR_POPUP, MY_LIST, TRASH, ARCHIVE, UPDATING,
  DIED_UPDATING, SETTINGS_VIEW_ACCOUNT, DIED_ADDING, DIED_MOVING,
} from '../types/const';
import {
  doContainListName, doContainTagName, getStatusCounts, isObject, isString, isNumber,
} from '../utils';
import vars from '../vars';

const initialState = {
  listName: MY_LIST,
  queryString: '',
  searchString: '',
  isSignUpPopupShown: false,
  isSignInPopupShown: false,
  isAddPopupShown: false,
  isSearchPopupShown: false,
  isProfilePopupShown: false,
  isCardItemMenuPopupShown: false,
  cardItemMenuPopupPosition: null,
  isListNamesPopupShown: false,
  listNamesPopupPosition: null,
  isPinMenuPopupShown: false,
  pinMenuPopupPosition: null,
  isCustomEditorPopupShown: false,
  isTagEditorPopupShown: false,
  isPaywallPopupShown: false,
  isConfirmDeletePopupShown: false,
  isConfirmDiscardPopupShown: false,
  isSettingsPopupShown: false,
  isSettingsListsMenuPopupShown: false,
  settingsListsMenuPopupPosition: null,
  isSettingsTagsMenuPopupShown: false,
  settingsTagsMenuPopupPosition: null,
  isTimePickPopupShown: false,
  timePickPopupPosition: null,
  isLockEditorPopupShown: false,
  isAccessErrorPopupShown: false,
  statuses: [],
  isHandlingSignIn: false,
  isBulkEditing: false,
  selectedLinkIds: [],
  selectingLinkId: null,
  selectingListName: null,
  selectingTagName: null,
  didFetch: false,
  didFetchSettings: false,
  fetchingInfos: [],
  showingLinkIds: null,
  hasMoreLinks: null,
  listChangedCount: 0,
  deleteAction: null,
  discardAction: null,
  settingsStatus: null,
  settingsViewId: SETTINGS_VIEW_ACCOUNT,
  isSettingsSidebarShown: false,
  didSettingsCloseAnimEnd: true,
  didSettingsSidebarAnimEnd: true,
  updateSettingsViewIdCount: 0,
  listNamesMode: null,
  listNamesAnimType: null,
  paywallFeature: null,
  lockAction: null,
  doForceLock: false,
  importAllDataProgress: null,
  exportAllDataProgress: null,
  deleteAllDataProgress: null,
};

const displayReducer = (state = initialState, action) => {

  if (action.type === REHYDRATE) {
    return { ...initialState };
  }

  if (action.type === UPDATE_LIST_NAME) {
    if (state.listName === action.payload && state.queryString === '') return state;

    return {
      ...state,
      listName: action.payload,
      queryString: '',
      selectedLinkIds: [],
      listChangedCount: state.listChangedCount + 1,
    };
  }

  if (action.type === UPDATE_QUERY_STRING) {
    if (state.queryString === action.payload) return state;

    const newState = { ...state, queryString: action.payload };
    newState.selectedLinkIds = [];
    [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
    newState.listChangedCount += 1;
    vars.fetch.doShowLoading = true;
    return newState;
  }

  if (action.type === UPDATE_SEARCH_STRING) {
    return { ...state, searchString: action.payload };
  }

  if (action.type === UPDATE_POPUP) {
    const { id, isShown, anchorPosition } = action.payload;

    if (id === ALL) {
      const newState = {
        ...state,
        isSignUpPopupShown: isShown,
        isSignInPopupShown: isShown,
        isAddPopupShown: isShown,
        isSearchPopupShown: isShown,
        isProfilePopupShown: isShown,
        isCustomEditorPopupShown: isShown,
        isTagEditorPopupShown: isShown,
        isPaywallPopupShown: isShown,
        isConfirmDeletePopupShown: isShown,
        isConfirmDiscardPopupShown: isShown,
        isSettingsPopupShown: isShown,
        isLockEditorPopupShown: isShown,
        //isAccessErrorPopupShown: isShown, // ErrorPopup should still be shown
      };
      if (!isShown) {
        newState.isCardItemMenuPopupShown = false;
        newState.cardItemMenuPopupPosition = null;
        newState.isListNamesPopupShown = false;
        newState.listNamesPopupPosition = null;
        newState.isPinMenuPopupShown = false;
        newState.pinMenuPopupPosition = null;
        newState.isSettingsListsMenuPopupShown = false;
        newState.settingsListsMenuPopupPosition = null;
        newState.isSettingsTagsMenuPopupShown = false;
        newState.settingsTagsMenuPopupPosition = null;
        newState.isTimePickPopupShown = false;
        newState.timePickPopupPosition = null;
      }
      return newState;
    }

    if (id === SIGN_UP_POPUP) {
      return { ...state, isSignUpPopupShown: isShown };
    }

    if (id === SIGN_IN_POPUP) {
      return { ...state, isSignInPopupShown: isShown };
    }

    if (id === ADD_POPUP) {
      return { ...state, isAddPopupShown: isShown };
    }

    if (id === SEARCH_POPUP) {
      return { ...state, isSearchPopupShown: isShown };
    }

    if (id === PROFILE_POPUP) {
      return { ...state, isProfilePopupShown: isShown };
    }

    if (id === CARD_ITEM_MENU_POPUP) {
      return {
        ...state,
        isCardItemMenuPopupShown: isShown,
        cardItemMenuPopupPosition: anchorPosition,
      };
    }

    if (id === LIST_NAMES_POPUP) {
      const newState = {
        ...state,
        isListNamesPopupShown: isShown,
        listNamesPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === PIN_MENU_POPUP) {
      const newState = {
        ...state,
        isPinMenuPopupShown: isShown,
        pinMenuPopupPosition: anchorPosition,
      };
      return newState;
    }

    if (id === CUSTOM_EDITOR_POPUP) {
      return { ...state, isCustomEditorPopupShown: isShown };
    }

    if (id === TAG_EDITOR_POPUP) {
      return { ...state, isTagEditorPopupShown: isShown };
    }

    if (id === PAYWALL_POPUP) {
      return { ...state, isPaywallPopupShown: isShown };
    }

    if (id === CONFIRM_DELETE_POPUP) {
      const newState = { ...state, isConfirmDeletePopupShown: isShown };
      return newState;
    }

    if (id === CONFIRM_DISCARD_POPUP) {
      const newState = { ...state, isConfirmDiscardPopupShown: isShown };
      return newState;
    }

    if (id === SETTINGS_POPUP) {
      const newState = { ...state, isSettingsPopupShown: isShown };
      if (isShown) {
        newState.didSettingsCloseAnimEnd = false;
        newState.didSettingsSidebarAnimEnd = true;
      }
      return newState;
    }

    if (id === SETTINGS_LISTS_MENU_POPUP) {
      return {
        ...state,
        isSettingsListsMenuPopupShown: isShown,
        settingsListsMenuPopupPosition: anchorPosition,
      };
    }

    if (id === SETTINGS_TAGS_MENU_POPUP) {
      return {
        ...state,
        isSettingsTagsMenuPopupShown: isShown,
        settingsTagsMenuPopupPosition: anchorPosition,
      };
    }

    if (id === TIME_PICK_POPUP) {
      return {
        ...state,
        isTimePickPopupShown: isShown,
        timePickPopupPosition: anchorPosition,
      };
    }

    if (id === LOCK_EDITOR_POPUP) {
      return { ...state, isLockEditorPopupShown: isShown };
    }

    if (id === ACCESS_ERROR_POPUP) {
      return { ...state, isAccessErrorPopupShown: isShown };
    }

    return state;
  }

  if (action.type === FETCH) {
    return { ...state, statuses: [...state.statuses, FETCH] };
  }

  if (action.type === FETCH_COMMIT) {
    const newState = {
      ...state,
      isAccessErrorPopupShown: false,
      statuses: [...state.statuses, FETCH_COMMIT],
      didFetch: true,
    };

    const { listNames, tagNames, doFetchStgsAndInfo, settings } = action.payload;
    if (!doFetchStgsAndInfo) return newState;

    newState.didFetchSettings = true;

    let doCtLn = false;
    if (listNames.includes(newState.listName)) doCtLn = true;
    if (settings) {
      if (doContainListName(newState.listName, settings.listNameMap)) doCtLn = true;
    } else {
      if ([MY_LIST, TRASH, ARCHIVE].includes(newState.listName)) doCtLn = true;
    }
    if (!doCtLn) newState.listName = MY_LIST;

    let doCtQt = false;
    const tagName = newState.queryString.trim(); // Only tag name for now
    if (tagNames.includes(tagName)) doCtQt = true;
    if (settings) {
      if (doContainTagName(tagName, settings.tagNameMap)) doCtQt = true;
    }
    if (!doCtQt) newState.queryString = '';

    return newState;
  }

  if (action.type === FETCH_ROLLBACK) {
    const { fthId, signInDT } = action.meta;

    const newState = { ...state, statuses: [...state.statuses, FETCH_ROLLBACK] };
    newState.fetchingInfos = state.fetchingInfos.filter(info => info.fthId !== fthId);
    if (!Array.isArray(newState.showingLinkIds)) newState.showingLinkIds = [];
    if (
      (
        isObject(action.payload) &&
        isString(action.payload.message) &&
        (
          action.payload.message.includes('401') ||
          action.payload.message.includes('GaiaError error 7')
        )
      ) ||
      (
        isObject(action.payload) &&
        isObject(action.payload.hubError) &&
        action.payload.hubError.statusCode === 401
      )
    ) {
      if (
        !isNumber(signInDT) ||
        (Date.now() - signInDT > 360 * 24 * 60 * 60 * 1000)
      ) {
        // Bug alert: Exceed usage rate limit also error 401.
        // If signed in less than 360 days, less likely the token expires,
        //   more about rate limit error.
        newState.isAccessErrorPopupShown = true;
      }
    }
    return newState;
  }

  if (
    action.type === UPDATE_FETCHED ||
    action.type === UPDATE_FETCHED_MORE ||
    action.type === SET_SHOWING_LINK_IDS
  ) {
    const newState = { ...state };

    if ('ids' in action.payload) {
      const { ids } = action.payload;
      newState.showingLinkIds = Array.isArray(ids) ? [...ids] : ids;
    }
    if ('hasMore' in action.payload) {
      newState.hasMoreLinks = action.payload.hasMore;
    }
    if ('doChangeListCount' in action.payload) {
      if (action.payload.doChangeListCount) newState.listChangedCount += 1;
    }
    if ('doClearSelectedLinkIds' in action.payload) {
      if (action.payload.doClearSelectedLinkIds) newState.selectedLinkIds = [];
    }
    return newState;
  }

  if (action.type === FETCH_MORE_ROLLBACK) {
    const { doForCompare, fthId } = action.meta;

    const newState = { ...state };
    if (doForCompare) newState.statuses = [...state.statuses, FETCH, FETCH_ROLLBACK];
    newState.fetchingInfos = state.fetchingInfos.filter(info => info.fthId !== fthId);
    return newState;
  }

  if (action.type === REFRESH_FETCHED) {
    const { doShowLoading, doScrollTop } = action.payload;

    const newState = { ...state };
    if (doShowLoading && Array.isArray(newState.showingLinkIds)) {
      newState.selectedLinkIds = [];
      [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
      vars.fetch.doShowLoading = true;
    }
    if (doScrollTop) newState.listChangedCount += 1;
    if (newState.didFetchSettings) {
      newState.didFetchSettings = false;
      newState.fetchingInfos = newState.fetchingInfos.map(info => {
        return { ...info, isInterrupted: true };
      });

      [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedLinkIds] = [[], []];
      vars.fetch.doForce = true;
    }

    return newState;
  }

  if (action.type === ADD_FETCHING_INFO) {
    return { ...state, fetchingInfos: [...state.fetchingInfos, { ...action.payload }] };
  }

  if (action.type === DELETE_FETCHING_INFO) {
    return {
      ...state,
      fetchingInfos: state.fetchingInfos.filter(info => info.fthId !== action.payload),
    };
  }

  if (action.type === ADD_LINKS) {
    const { links, insertIndex } = action.payload;
    if (!Array.isArray(links) || !isNumber(insertIndex)) return state;
    if (!Array.isArray(state.showingLinkIds)) return state;

    let linkIds = links.map(link => link.id);
    linkIds = linkIds.filter(id => !state.showingLinkIds.includes(id));

    const newState = { ...state };
    newState.showingLinkIds = [
      ...newState.showingLinkIds.slice(0, insertIndex),
      ...linkIds,
      ...newState.showingLinkIds.slice(insertIndex),
    ];
    return newState;
  }

  if (
    action.type === MOVE_LINKS_DELETE_STEP_COMMIT ||
    action.type === DELETE_LINKS_COMMIT
  ) {
    const { successIds } = action.payload;
    return {
      ...state,
      showingLinkIds: _filterIfNotNull(state.showingLinkIds, successIds),
    };
  }

  if (action.type === CANCEL_DIED_LINKS) {
    const { ids, statuses, fromIds } = action.payload;
    if (!Array.isArray(state.showingLinkIds)) return state;

    const newState = { ...state };
    newState.showingLinkIds = [];
    for (const id of state.showingLinkIds) {
      const i = ids.findIndex(_id => _id === id);
      if (i < 0) {
        newState.showingLinkIds.push(id);
        continue;
      }

      const [status, fromId] = [statuses[i], fromIds[i]];
      if ([DIED_ADDING, DIED_MOVING].includes(status)) continue;
      if ([DIED_UPDATING].includes(status)) {
        newState.showingLinkIds.push(fromId);
        continue;
      }

      newState.showingLinkIds.push(id);
    }

    return newState;
  }

  if (action.type === EXTRACT_CONTENTS) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS] };
  }

  if (action.type === EXTRACT_CONTENTS_COMMIT) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS_COMMIT] };
  }

  if (action.type === EXTRACT_CONTENTS_ROLLBACK) {
    return { ...state, statuses: [...state.statuses, EXTRACT_CONTENTS_ROLLBACK] };
  }

  if (action.type === UPDATE_EXTRACTED_CONTENTS) {
    const { successLinks } = action.payload;

    const fromMap = {};
    for (const link of successLinks) fromMap[link.fromId] = link.id;

    const newState = { ...state };
    // If bulk editing, no extract contents. And while extracting, no select.
    //   So no need update selectedLinkIds here.
    // If showing menu, no extract contents. But while extracting, can show menu popup.
    //   So need to update selectingLinkId here.
    if (isString(fromMap[state.selectingLinkId])) {
      newState.selectingLinkId = fromMap[state.selectingLinkId];
    }
    if (Array.isArray(state.showingLinkIds)) {
      newState.showingLinkIds = [];
      for (const id of state.showingLinkIds) {
        if (isString(fromMap[id])) {
          newState.showingLinkIds.push(fromMap[id]);
          continue;
        }
        newState.showingLinkIds.push(id);
      }
    }

    return newState;
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH) {
    return { ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH] };
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_COMMIT) {
    const { successIds } = action.payload;

    const newState = {
      ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH_COMMIT],
    };
    newState.showingLinkIds = _filterIfNotNull(state.showingLinkIds, successIds);
    return newState;
  }

  if (action.type === DELETE_OLD_LINKS_IN_TRASH_ROLLBACK) {
    return {
      ...state, statuses: [...state.statuses, DELETE_OLD_LINKS_IN_TRASH_ROLLBACK],
    };
  }

  if (action.type === UPDATE_CUSTOM_DATA) {
    const { fromLink, toLink } = action.payload;
    if (!isObject(fromLink) || !isObject(toLink)) return state;
    if (!Array.isArray(state.showingLinkIds)) return state;

    const newState = { ...state };
    newState.showingLinkIds = [];
    for (const id of state.showingLinkIds) {
      if (id === fromLink.id) {
        newState.showingLinkIds.push(toLink.id);
        continue;
      }
      newState.showingLinkIds.push(id);
    }

    return newState;
  }

  if (action.type === UPDATE_STATUS) {
    if (action.payload === null) {
      const statusCounts = getStatusCounts(state.statuses);

      let isActive = false;
      for (const statusCount of statusCounts) {
        if (statusCount.count > 0) isActive = true;
      }
      if (!isActive) return { ...state, statuses: [] };
    }
    return { ...state, statuses: [...state.statuses, action.payload] };
  }

  if (action.type === UPDATE_HANDLING_SIGN_IN) {
    return { ...state, isHandlingSignIn: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    const newState = { ...state, isBulkEditing: action.payload };
    if (!action.payload) newState.selectedLinkIds = [];
    return newState;
  }

  if (action.type === ADD_SELECTED_LINK_IDS) {
    const selectedLinkIds = [...state.selectedLinkIds];
    for (const linkId of action.payload) {
      if (!selectedLinkIds.includes(linkId)) selectedLinkIds.push(linkId);
    }
    return { ...state, selectedLinkIds };
  }

  if (action.type === DELETE_SELECTED_LINK_IDS) {
    const selectedLinkIds = [];
    for (const linkId of state.selectedLinkIds) {
      if (!action.payload.includes(linkId)) selectedLinkIds.push(linkId);
    }
    return { ...state, selectedLinkIds };
  }

  if (action.type === UPDATE_SELECTING_LINK_ID) {
    return { ...state, selectingLinkId: action.payload };
  }

  if (action.type === UPDATE_SELECTING_LIST_NAME) {
    return { ...state, selectingListName: action.payload };
  }

  if (action.type === DELETE_LIST_NAMES) {
    const { listNames } = action.payload;
    if (!listNames.includes(state.listName)) return state;
    return { ...state, listName: MY_LIST };
  }

  if (action.type === UPDATE_DELETE_ACTION) {
    return { ...state, deleteAction: action.payload };
  }

  if (action.type === UPDATE_DISCARD_ACTION) {
    return { ...state, discardAction: action.payload };
  }

  if (action.type === UPDATE_SETTINGS) {
    return {
      ...state,
      statuses: [...state.statuses, UPDATE_SETTINGS],
      settingsStatus: UPDATING,
    };
  }

  if (action.type === UPDATE_SETTINGS_COMMIT) {
    const { doFetch } = action.payload;

    const newState = {
      ...state,
      statuses: [...state.statuses, UPDATE_SETTINGS_COMMIT],
      settingsStatus: null,
    };
    if (doFetch && Array.isArray(newState.showingLinkIds)) {
      newState.selectedLinkIds = [];
      [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
      newState.listChangedCount += 1;
      [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_ROLLBACK) {
    return {
      ...state,
      statuses: [...state.statuses, UPDATE_SETTINGS_ROLLBACK],
      settingsStatus: DIED_UPDATING,
    };
  }

  if (action.type === CANCEL_DIED_SETTINGS || action.type === MERGE_SETTINGS_COMMIT) {
    const { settings } = action.payload;

    const doFetch = action.type === CANCEL_DIED_SETTINGS ?
      action.payload.doFetch : action.meta.doFetch;

    let doCtLn = false;
    if (doContainListName(state.listName, settings.listNameMap)) doCtLn = true;

    let doCtQt = false;
    const tagName = state.queryString.trim(); // Only tag name for now
    if (doContainTagName(tagName, settings.tagNameMap)) doCtQt = true;

    let isActive = false;
    for (const statusCount of getStatusCounts(state.statuses)) {
      if (statusCount.count > 0) isActive = true;
    }

    const newState = {
      ...state,
      listName: doCtLn ? state.listName : MY_LIST,
      queryString: doCtQt ? state.queryString : '',
      statuses: isActive ? [...state.statuses, null] : [],
      settingsStatus: null,
    };
    if (doFetch && Array.isArray(newState.showingLinkIds)) {
      newState.selectedLinkIds = [];
      [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
      newState.listChangedCount += 1;
      [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    }
    return newState;
  }

  if (action.type === UPDATE_SETTINGS_VIEW_ID) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_LIST_NAMES_MODE) {
    return { ...state, ...action.payload };
  }

  if (action.type === UPDATE_PAYWALL_FEATURE) {
    return { ...state, paywallFeature: action.payload };
  }

  if (action.type === UPDATE_LOCK_ACTION) {
    return { ...state, lockAction: action.payload };
  }

  if ([ADD_LOCK_LIST, LOCK_LIST].includes(action.type)) {
    return state;
  }

  if (action.type === UPDATE_LOCKS_FOR_ACTIVE_APP) {
    const { isLong, doNoChangeMyList } = action.payload;
    const { queryString, doForceLock } = state;

    const newState = { ...state, doForceLock: false };
    if (isLong) {
      newState.selectedLinkIds = [];
    }
    if (
      (!queryString && isLong && doNoChangeMyList && !doForceLock) ||
      (!queryString && isLong && doNoChangeMyList && doForceLock) ||
      (queryString && isLong && !doNoChangeMyList && doForceLock) ||
      (queryString && isLong && doNoChangeMyList && !doForceLock) ||
      (queryString && isLong && doNoChangeMyList && doForceLock)
    ) {
      newState.listName = MY_LIST;
      newState.queryString = '';
      newState.searchString = '';
      newState.isBulkEditing = false;
      newState.listChangedCount = newState.listChangedCount + 1;
      newState.isCustomEditorPopupShown = false;
      newState.isTagEditorPopupShown = false;
    }
    return newState;
  }

  if (action.type === UPDATE_LOCKS_FOR_INACTIVE_APP) {
    return {
      ...state,
      doForceLock: true,
      isCardItemMenuPopupShown: false,
      cardItemMenuPopupPosition: null,
      isListNamesPopupShown: false,
      listNamesPopupPosition: null,
      isPinMenuPopupShown: false,
      pinMenuPopupPosition: null,
      // CustomEditorPopup (and some others) won't be rendered by Main when locked,
      //   so no need to force close it.
      // And can't because ImagePicker makes app inactive!
      //isCustomEditorPopupShown: false,
      //isTagEditorPopupShown: false,
      isLockEditorPopupShown: false, // Force close in case of already filling password.
      isConfirmDeletePopupShown: false,
    };
  }

  if (action.type === UPDATE_TAG_DATA_S_STEP_COMMIT) {
    const { doFetch } = action.payload;
    if (!doFetch || !Array.isArray(state.showingLinkIds)) return state;

    const newState = { ...state };
    newState.selectedLinkIds = [];
    [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
    newState.listChangedCount += 1;
    [vars.fetch.fetchedLnOrQts, vars.fetch.doShowLoading] = [[], true];
    return newState;
  }

  if (action.type === UPDATE_TAG_DATA_T_STEP_COMMIT) {
    const { id, values } = action.payload;

    if (state.queryString) {
      // Only tag name for now
      const tagName = state.queryString.trim();
      const found = values.some(value => value.tagName === tagName);
      if (!found) {
        return {
          ...state,
          showingLinkIds: _filterIfNotNull(state.showingLinkIds, [id]),
        };
      }
    }

    return state;
  }

  if (action.type === UPDATE_SELECTING_TAG_NAME) {
    return { ...state, selectingTagName: action.payload };
  }

  if (action.type === DELETE_TAG_NAMES) {
    const { tagNames } = action.payload;
    // Only tag name for now
    if (!tagNames.includes(state.queryString)) return state;
    return { ...state, queryString: '' };
  }

  if (action.type === UPDATE_IMPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    const newState = { ...state, importAllDataProgress: progress };
    if (isObject(progress) && progress.total && progress.done) {
      if (progress.total === progress.done) {
        newState.selectedLinkIds = [];
        newState.didFetchSettings = false;
        [newState.showingLinkIds, newState.hasMoreLinks] = [null, null];
        newState.listChangedCount += 1;
        [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedLinkIds] = [[], []];
        [vars.fetch.doShowLoading, vars.fetch.doForce] = [true, true];
      }
    }
    return newState;
  }

  if (action.type === UPDATE_EXPORT_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, exportAllDataProgress: progress };
  }

  if (action.type === UPDATE_DELETE_ALL_DATA_PROGRESS) {
    const progress = isObject(action.payload) ? { ...action.payload } : action.payload;
    return { ...state, deleteAllDataProgress: progress };
  }

  if (action.type === DELETE_ALL_DATA) {
    const newState = {
      ...initialState,
      didFetch: true, didFetchSettings: true, showingLinkIds: [], hasMoreLinks: false,
    };
    [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedLinkIds] = [[MY_LIST], []];
    return newState;
  }

  if (action.type === RESET_STATE) {
    [vars.fetch.fetchedLnOrQts, vars.fetch.fetchedLinkIds] = [[], []];
    return { ...initialState };
  }

  return state;
};

const _filterIfNotNull = (arr, excludingElems) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(el => !excludingElems.includes(el));
};

export default displayReducer;

import React from 'react';

import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsTagsMenuPopup from './SettingsTagsMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import TagErrorPopup from './TagErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import LockEditorPopup from './LockEditorPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';
import HubErrorPopup from './HubErrorPopup';

const GlobalPopups = () => (
  <>
    <SettingsPopup />
    <SettingsListsMenuPopup />
    <SettingsTagsMenuPopup />
    <TimePickPopup />
    <PinErrorPopup />
    <TagErrorPopup />
    <SettingsConflictErrorPopup />
    <SettingsUpdateErrorPopup />
    <ListNamesPopup />
    <LockEditorPopup />
    <ConfirmDeletePopup />
    <ConfirmDiscardPopup />
    <PaywallPopup />
    <AccessErrorPopup />
    <HubErrorPopup />
  </>
);

export default React.memo(GlobalPopups);

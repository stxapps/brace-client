package com.brace;

import android.content.Intent;
import com.facebook.react.ReactActivity;

public class ShareActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Save to Brace";
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }

  @Override
  public void finish() {
    super.finish();
    overridePendingTransition(0, 0);
  }
}

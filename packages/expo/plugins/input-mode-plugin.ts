const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdjustNothing(config) {
  return withAndroidManifest(config, config => {
    const application = config.modResults.manifest.application[0];
    const mainActivity = application.activity?.find(
      (activity) => activity.$?.['android:name']?.includes('MainActivity')
    );
    mainActivity.$['android:windowSoftInputMode'] = 'adjustNothing';
    return config;
  });
}

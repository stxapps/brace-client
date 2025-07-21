const { withPodfile } = require('@expo/config-plugins');

module.exports = function withBlockstack(config) {
  return withPodfile(config, (config) => {
    const lines = config.modResults.contents.split('\n');

    const rnfaLine = '$RNFANoPrivacyAPI = true';
    const bcksckLine = "  pod 'Blockstack', :git => 'https://github.com/stxapps/blockstack-ios.git', :commit => '5b4ffc1'";

    let foundRNFA = false, foundBcksck = false, sIdx = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === rnfaLine) foundRNFA = true;
      if (line === bcksckLine) foundBcksck = true;
      if (line.startsWith("target '")) sIdx = i;
    }
    if (sIdx === null) throw new Error('Invalid sIdx');

    let newLines = lines;
    if (!foundRNFA && !foundBcksck) {
      newLines = [
        ...lines.slice(0, sIdx),
        rnfaLine,
        lines[sIdx],
        bcksckLine,
        ...lines.slice(sIdx + 1)
      ];
    } else if (!foundRNFA) {
      newLines = [...lines.slice(0, sIdx), rnfaLine, ...lines.slice(sIdx)];
    } else if (!foundBcksck) {
      newLines = [...lines.slice(0, sIdx + 1), bcksckLine, ...lines.slice(sIdx + 1)];
    }

    config.modResults.contents = newLines.join('\n');
    return config;
  });
}

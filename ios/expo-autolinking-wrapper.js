// Wraps expo-modules-autolinking to inject reactNativePath, which
// react-native 0.83's autolinking.rb requires but Expo SDK 55 doesn't emit.
const { execFileSync } = require('child_process');
const path = require('path');

const rnDir = path.dirname(require.resolve('react-native/package.json'));

const json = execFileSync(
  process.execPath,
  [
    '--no-warnings',
    '--eval', "require('expo/bin/autolinking')",
    'expo-modules-autolinking',
    'react-native-config',
    '--json',
    '--platform', 'ios',
  ],
  { encoding: 'utf8' }
);

const config = JSON.parse(json);
config.reactNativePath = rnDir;
process.stdout.write(JSON.stringify(config));

module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src'
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    ],
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true
    }],
    'react-native-reanimated/plugin'
  ]
};




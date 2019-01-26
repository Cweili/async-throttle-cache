module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        loose: true,
        modules: false,
        exclude: [
          'transform-typeof-symbol',
          'transform-async-to-generator',
          'transform-regenerator'
        ]
      }
    ]
  ],
  plugins: ['module:fast-async']
}

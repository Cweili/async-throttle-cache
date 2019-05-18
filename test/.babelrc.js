module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        "targets": {
          "node": "current",
        },
        loose: true,
        exclude: [
          '@babel/plugin-transform-typeof-symbol'
        ]
      }
    ]
  ],
}

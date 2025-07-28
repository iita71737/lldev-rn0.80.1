import Rainbow from 'rainbowvis.js'
export default {
  getColors(range, startColor, endColor) {
    const rainbow = new Rainbow()
    rainbow.setNumberRange(0, range)
    rainbow.setSpectrum(startColor, endColor)
    const _colors = []
    for (let i = 1; i <= range; i++) {
      _colors.push(`#${rainbow.colorAt(i)}`)
    }
    return _colors
  },
  getColorFamily(color, range, light, dark) {
    const _lightColors = this.getColors(range, light, color)
    const _darkColors = this.getColors(range, color, dark)
    const _colorFamily = []
    _lightColors.forEach((_lightColor, _lightColorIndex) => {
      if (_lightColorIndex == _lightColors.length - 1) {
        return
      } else {
        _colorFamily.push(_lightColor)
      }
    })
    _darkColors.forEach(_darkColor => {
      _colorFamily.push(_darkColor)
    })
    return _colorFamily
  }
}

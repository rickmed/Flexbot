'use strict'

/* ExcelJS */

function fillColor (color) {

    if (color === 'green') color = '001BCE3C'
    if (color === 'yellow') color = '00EBF02A'
    if (color === 'red') color = '00E41515'

    let fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
    }

    return fill
}


module.exports = {
    fillColor
}

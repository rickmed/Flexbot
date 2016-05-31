'use strict'

module.exports = {
    logColumn,
    logAllRows,
    deleteColumn,
    deleteWorksheet,
    findRowIn,
    findAllRowsIn
}


/**
 * Module dependencies
 */
var R = require('ramda')


/**
 * Namespace methods
 */

/**
 * @param {object} column - exceljs column
 */
function logColumn (column) {
    column.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
        console.log(rowNumber + ': ' + cell.value)
    })
}


/**
 * @param {object} worksheet - exceljs worksheet
 */
function logAllRows (worksheet) {
    worksheet.eachRow(function (row, rowNumber) {
        console.log('Row ' + rowNumber + ' = ' + row.values)
    })
}


/**
 * @param {object} column - exceljs column
 */
function deleteColumn (column) {
    column.eachCell(function (cell) {
        cell.value = null
    })
}


/**
 * @param {object} worksheet - exceljs worksheet
 */
function deleteWorksheet (worksheet) {
    worksheet.eachRow(function (row) {
        row.values = null
    })
}


/**
 * @param {object} column - exceljs column
 * @param {regex} regex to test each column cell
 * @returns {Number | undefined} if nothing matches
 */
function findRowIn (column, regex) {
// can't stop the eachCell loop, so need to freeze rowIndex to first match
    let rowIndex
    let setIndex = R.once(val => rowIndex = val)

    column.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
        if (R.test(regex, cell.value)) {
            setIndex(rowNumber)
        }
    })

    return rowIndex
}


/**
 * @param {object} column - exceljs column
 * @param {regex} regex to test each column cell
 * @returns {Array of numbers | undefined} if nothing matches
 */
function findAllRowsIn (column, regex) {

    let indexes = []

    column.eachCell({ includeEmpty: true }, function (cell, rowNumber) {
        if (R.test(regex, cell.value)) {
            indexes.push(rowNumber)
        }
    })

    return indexes
}

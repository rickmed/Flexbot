'use strict'

/**
 * Module dependencies
 */
const EventEmitter = require('events')
const Promise = require('bluebird')
const Excel = require('exceljs')
const R = require('ramda')
const Sailbot = require('sailbot')

const findRowIn = require('./helpers/excel_js.js').findRowIn
const DATA = require('./data/data')

const Async = Promise.coroutine
const CSS = DATA.cssSelectors
const FRAME = DATA.frames
const MSG = DATA.msg
const XLSX = DATA.excel
const CENTRIFUGA = DATA.centrifuga
const FLX_URL = DATA.flexUrl


/**
 * @param {string} excel file path
 * @param  {object} with "id" {string}: sessionId for attaching to a session
 */
const updateFlexBs = Async(function*(xlsxPath, options) {

  /*
   * "Globals"
   */

  const wb = new Excel.Workbook()
  yield wb.xlsx.readFile(xlsxPath)
  const ws1 = wb.getWorksheet(XLSX.misPubs)
  let $_TODAY
  let cellMsg
  let colMetaIds
  let flxIds
  let outdatedPubs
  let pub // state control: currently processing pub


  const go = Sailbot(options)

  const events = new EventEmitter()
  go.on = events.on
  go.emit = events.emit



  /*
   * Helper functions definitions
   */

  function dolar() {
    const ws2 = wb.getWorksheet(XLSX.dollar)
    $_TODAY = ws2.getCell(XLSX.cellDolar).value
    cellMsg = ws2.getCell(XLSX.msjeFlxBot)
    cellMsg.value = null
  }


  const userLogin = Async(function*() {
    go.to(FLX_URL)
    go.waitFor(CSS.topFrame).isFound()
    console.log('Logging in...')
    yield go.switchTo(FRAME.topFrame).get(CSS.myListings).click('promise')
  })


  /* Sync pubs' data Excel-Flex */

  const syncPubs = Async(function*() {

    colMetaIds = ws1.getColumn(XLSX.colMetaId)
    flxIds = yield go.switchTo(FRAME.viewFrame)
      .getAll(CSS.gridListingsIDs).attribute('id')

    deletedFlxPubs()
    yield newFlxPubs()

    setXlsOutdated()

    go.emit('writeExcel')
    return yield go.driver.getCurrentUrl()
  })

  // delete pubs from the excel that were deleted on flex
  function deletedFlxPubs() {

    const xlsIds = {}
    colMetaIds.eachCell(function(cell, rowNumber) {
      xlsIds[cell.value] = rowNumber
    })

    const deletedPubs = R.omit(flxIds, xlsIds)
    delete deletedPubs['Meta Listing ID']

    if (deletedPubs !== {}) {

      console.log('Deleted pubs in Flex:\n', deletedPubs)

      for (let row in deletedPubs) {
        const msg = [MSG.pubDeleted + ' ' + deletedPubs[row]]
        ws1.getRow(deletedPubs[row]).values = msg
      }
    }
  }

  // sync new pubs in flex that are not in the excel
  const newFlxPubs = Async(function*() {

    const xlsIds = []
    colMetaIds.eachCell(function(cell) {
      xlsIds.push(cell.value)
    })

    const newPubs = R.without(xlsIds, flxIds)

    if (newPubs !== []) {

      const pubs = {}
      for (let id of newPubs) {
        pubs[id] = {
          flxCode: yield go.get(CSS.flxCode(id)).text(),
          dir: yield go.get(CSS.direccion(id)).text(),
          tipo: yield go.get(CSS.tipo(id)).text(),
          bs: yield go.get(CSS.priceBs(id)).text(),
          mts: yield go.get(CSS.mts2(id)).text(),
          habs: yield go.get(CSS.habs(id)).text(),
          banos: yield go.get(CSS.banos(id)).text()
        }
      }

      newPubs.forEach((id, i) => {
        const newRow = ws1.getRow(xlsIds.length + i + 1)
        newRow.getCell(XLSX.colMetaId).value = id
        newRow.getCell(XLSX.colFlxCode).value = pubs[id].flxCode
        newRow.getCell(XLSX.colDir).value = pubs[id].dir
        newRow.getCell(XLSX.colTipo).value = pubs[id].tipo
        newRow.getCell(XLSX.colBs).value = pubs[id].bs
        newRow.getCell(XLSX.colMts).value = pubs[id].mts
        newRow.getCell(XLSX.colHabs).value = pubs[id].habs
        newRow.getCell(XLSX.colBanos).value = pubs[id].banos
      })
    }

    console.log('New Pubs in Flex synced in Excel:\n', newPubs)
    return yield go.driver.getCurrentUrl()
  })

  // writes 'Desactualizada' if $_TODAY changed
  function setXlsOutdated() {

    const regex = new RegExp($_TODAY)

    ws1.eachRow(function(row, rowNumber) {

      const id = row.getCell(XLSX.colMetaId).value
      const cellMsje = row.getCell(XLSX.colMsje)

      const cond1 = rowNumber !== 1
      const cond2 = !R.test(regex, cellMsje.value)
      const cond3 = R.test(/row/, id)

      if (cond1 && cond2 && cond3) {
        cellMsje.value = MSG.outdated
      }
    })
  }



  /* Builds all the outdated pubs info to update */

  /*
   * @param {object} excel workbook
   * @returns {Array} of { id, cellMsje, processed }
   */
  function outdated() {

    const pubs = []
    const pubsToUpdate = []
    ws1.eachRow(function(row) {

      let id = row.getCell(XLSX.colMetaId).value
      let flxCode = row.getCell(XLSX.colFlxCode).value
      let cellMsje = row.getCell(XLSX.colMsje)

      if (cellMsje.value === MSG.outdated) {

        pubs.push({
          id,
          flxCode,
          cellMsje,
          processed: false
        })

        pubsToUpdate.push(flxCode)
      }
    })

    console.log('Pubs to be updated:\n', pubsToUpdate)

    outdatedPubs = pubs
  }



  /* Loop functions */

  const loop = Async(function*() {

    outdatedPubs = outdatedPubs.filter((el) => el.processed === false)

    for (pub of outdatedPubs) {

      let observ = yield goTolistingInformation()
      pub.newBs = calcNewBs(observ)
      if (typeof pub.newBs === 'number') {
        yield changeBs()
        yield confirmNewBs()
      } else yield dontUpdate()

      yield syncXlsBs()

      go.emit('pubProcessed')
    }

    go.emit('done')
  })


  /* @param {string} -> {string} campo observaciones */
  const goTolistingInformation = Async(function*() {

    console.log('Attempting to update:', pub.flxCode)

    let cssTriangle = CSS.listingTriangle(pub.id)
    go.switchTo(FRAME.viewFrame).get(cssTriangle).click()
      .get(CSS.editListing).click()
      .switchTo(FRAME.overlayFrame).get(CSS.listingInformation).click()
    return yield go.switchTo(FRAME.overlayFrame)
      .get(CSS.observaciones).text()
  })


  /**
   * @param  {String} str where the usd price (in centrifuga code) is
   * @param  {Number} current price of $/Bs
   * @returns {Number | Array} new price in Bs | codigos centrifuga found
   */
  const calcNewBs = function(str) {

    let codigo = R.match(CENTRIFUGA.regex, str)
    console.log('Codigo Centrifuga found:', codigo)

    if (codigo.length === 1) {
      return _codigoToUsd(codigo[0]) * $_TODAY
    } else return codigo
  }

  /* @param {string} -> {number} */
  const _codigoToUsd = R.pipe(
    // ramba's map accepts a string
    R.map(letter => letter = CENTRIFUGA.keys[letter]),
    R.join(''),
    R.tap(str => parseInt(str))
  )


  /* @param {object} -> {object} */
  const changeBs = Async(function*() {

    let oldBs = yield go.get(CSS.precioMinimo).attribute('value')
    pub.oldBs = parseInt(oldBs)

    // some publications have USD price in centrifuga with 000, others not
    if ((pub.oldBs / pub.newBs) > 500) pub.newBs *= 1000

    go.switchTo(FRAME.overlayFrame)
      .get(CSS.precioMinimo).clear().write(pub.newBs)
      .get(CSS.saveChanges).click()
    changeListPrice(go, pub)
  })


  function changeListPrice() {
    go.get(CSS.changeListPrice).click()
      .get(CSS.newListPrice).clear().write(pub.newBs)
      .get(CSS.next).click()
      .switchTo(FRAME.topFrame).get(CSS.myListings).click()
  }


  const confirmNewBs = Async(function*() {

    let selector = CSS.priceBs(pub.id)
    let listingBs = yield go.switchTo(FRAME.viewFrame).get(selector).text()
    let val = parseInt(listingBs.replace(/,|Bsf/g, ''))

    console.log('Change Confirmed:\n',
      `Old Price: ${pub.oldBs} -> New Price: ${pub.newBs}`)

    let cellMsje = pub.cellMsje

    if (val === pub.newBs) {
      cellMsje.value = 'Actualizada a ' + $_TODAY
    }
    else {
      console.log('flexBot: error confirming old price vs new price')
      cellMsje.value = MSG.somethingWrongErr
      let msg = 'Error confirmando cambio de precio. Consulte con el administrador'
      errEnd(msg)
    }
  })


  // updates bs in excel from flex
  const syncXlsBs = Async(function*() {

    let regex = new RegExp(pub.id)

    let colMetaIds = ws1.getColumn(XLSX.colMetaId)
    let rowIndex = findRowIn(colMetaIds, regex)

    let flxBs = yield go.switchTo(FRAME.viewFrame)
      .get(CSS.priceBs(pub.id)).text()

    let cellBs = ws1.getRow(rowIndex).getCell(XLSX.colBs)
    cellBs.value = flxBs
  })


  const dontUpdate = Async(function*() {

    go.switchTo(FRAME.topFrame).get(CSS.myListings).click()
    yield go.alert().accept() // leaving the page on unsaved changes

    let newBs = pub.newBs
    let cellMsje = pub.cellMsje

    // calcNewBs returns array of codigos centrifuga found if +1 or 0
    if (newBs.length === 0) {
      cellMsje.value = MSG.noCentrifuga
      console.log(MSG.noCentrifuga)
    } else if (newBs.length > 1) {
      cellMsje.value = MSG.tooManyUpper
      console.log(MSG.tooManyUpper)
    }
  })


  /* Error handling functions */

  const handleErr = Async(function*(err) {
    if (err.name === 'UnexpectedAlertOpenError') {
      console.log('CATCHED ERROR: Webdriver Unexpected Alert Open')

      let msg = yield go.alert().getText()
      msg = msg.slice(118)
      if (msg === 'Entry required in Req. ShowingFeedBack') {
        console.log(`Unexpected alert: "${msg}."\n` +
          `Trying to update pub...`)
        go.emit('reqShowingAlert')
      }
    } else if (err.name === 'TimeoutError') {
      console.log('CATCHED ERROR: Webdriver Timeout')
      let msg = 'Problemas con la pagina o el internet. ' +
        'Por favor intente mas tarde'
      errEnd(msg)
    } else {
      console.log('There was an ERROR: ', err.stack)
      let msg = 'Error desconocido. Consulte con el administrador'
      errEnd(msg)
    }
  })


  const reqAlert = Async(function*() {
    yield go.alert().accept()
    go.get(CSS.reqShowing).click()
      .get(CSS.saveChanges).click()

    changeListPrice()
    yield confirmNewBs()
    yield syncXlsBs()

    go.emit('pubProcessed')
    go.emit('runLoop')
  })



  /* Services */

  const writeExcel = Async(function*() {
    try {
      yield wb.xlsx.writeFile(xlsxPath)
      console.log('Excel File Written')
    } catch (err) {
      console.log(`Flexbot: Excel file was opened. Exiting process...`)
      yield go.quit()
    }
  })


  const errEnd = Async(function*(msg) {
    cellMsg.value = msg
    yield writeExcel(msg)
    console.log('Wrote in excel:', msg)
    yield go.quit()
  })


  function Done() {
    console.log('Done updating all publications prices. Quiting...')
    go.quit()
  }


  /*
   * Main
   */

  process.on('uncaughtException', (err) => handleErr(err))
  go.on('reqShowingAlert', () => reqAlert())
  go.on('timeoutError', () => timeout())
  go.on('runLoop', () => loop())
  go.on('writeExcel', () => writeExcel())
  go.on('pubProcessed', () => {
    go.emit('writeExcel')
    go.emit('pubState')
  })
  go.on('pubState', () => pub.processed = true)
  go.on('done', () => Done())

  dolar()

  yield userLogin()

  yield syncPubs()

  outdated(ws1)

  go.emit('runLoop')

})



module.exports = updateFlexBs

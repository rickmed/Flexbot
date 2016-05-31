exports.cssSelectors = {
  topFrame: '#top_frame',
  myListings: 'a[name=my_listings]',
  flexCodes: 'span.mastermergedcolumnonelineshow a.columnlink',
  gridListingsIDs: '#thegridbody .listing',
  listingTriangle(pubId) {
    return '#' + pubId + ' > td:nth-child(2) > span > div > span:nth-child(7) > span.listnbrcontainer > img'
  },
  flxCode(pubId) {
    return '#' + pubId + ' > td:nth-child(2) > span > div > span:nth-child(7) > span.listnbrcontainer > a'
  },
  direccion(pubId) {
    return '#' + pubId + ' > td:nth-child(2) > span > div > span:nth-child(3) > span > span'
  },
  tipo(pubId) {
    return '#' + pubId + ' > td:nth-child(6)'
  },
  priceBs(pubId) {
    return '#' + pubId + ' > td:nth-child(2) > span > div > span.price'
  },
  mts2(pubId) {
    return '#' + pubId + ' > td:nth-child(8)'
  },
  habs(pubId) {
    return '#' + pubId + ' > td:nth-child(9)'
  },
  banos(pubId) {
    return '#' + pubId + ' > td:nth-child(10)'
  },
  editListing: '#editlistinglink',
  listingInformation: '#listing-information',
  observaciones: '#remark2',
  precioMinimo: '#low_price',
  saveChanges: '#header > div:nth-child(1) > button:nth-child(1)',
  changeListPrice: 'body > table:nth-child(11) > tbody > tr:nth-child(4) > td:nth-child(1) > div > div > a:nth-child(3)',
  newListPrice: '#list_price',
  next: '#inputform > table > tbody > tr:nth-child(4) > td > input',
  backToSearch: '#backToSearch',
  reqShowing: '#i_1',
  usuario: '#user',
  contrasena: '#password',
  login: '#login-button'
}

exports.frames = {
  aoFrame: ['aoframe'], // usuario, contrasena
  topFrame: ['top_frame'], // myListings
  viewFrame: ['top_frame', 'view_frame'], // flexCodes, gridListingsIDs, backToSearch
  overlayFrame: ['top_frame', 'view_frame', 'overlayframe'] // observaciones, precioMinimo, listingInformation, saveChanges, changeListPrice, reqShowing
}

exports.flexUrl = 'http://ven.flexmls.com/'

exports.centrifuga = {
  regex: /[CENTRIFUGA]{3,7}/g,
  keys: {
    C: 1,
    E: 2,
    N: 3,
    T: 4,
    R: 5,
    I: 6,
    F: 7,
    U: 8,
    G: 9,
    A: 0
  }
}

exports.msg = {
  tooManyUpper: 'No actualizada. Mama, ya te dije que no puedes poner letras en mayusculas en el campo Observaciones :)',
  noCentrifuga: 'No actualizada. No hay codigo centrifuga en el campo Observaciones',
  somethingWrongErr: 'No actualizada. Algo esta mal. Por favor consulte al administrador :(',
  pubDeleted: 'No existe en flex',
  outdated: 'Desactualizada'
}

exports.excel = {
  wsPubs: 'Mis Publicaciones',
  colMetaId: 'A',
  colFlxCode: 'B',
  colDir: 'C',
  colTipo: 'D',
  colBs: 'E',
  colMts: 'F',
  colHabs: 'G',
  colBanos: 'H',
  colMsje: 'I',
  dollar: 'Precio Dolar',
  cellDolar: 'A2',
  msjeFlxBot: 'A5'
}

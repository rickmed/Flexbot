import React from 'react'
import { observer } from 'mobx-react'
import { Meteor } from 'meteor/meteor'
// const Nightmare = electronRequire('nightmare-meteor')

const Input = observer(React.createClass({

  updateLechuga(ev) {
    ev.preventDefault()
    const inputEl = this.refs.input
    const newPrice = parseInt(inputEl.value.trim())
    Meteor.call('updateLechuga', newPrice, () => {
      inputEl.value = ''
    })
  },

  openNightmare: async function () {
  //   window.nightmare = Nightmare({
  //     show: true,
  //     width: 1500,
  //     height: 700,
  //     openDevTools: true,
  //     alwaysOnTop: false
  //   })
  //
  //   const settings = Meteor.settings.public
  //
  //   await window.nightmare
  //     .on('console', function(method, message) { console[method](message); })
  //     .goto('http://ven.flexmls.com')
  //     .type('#user', settings.user)
  //     .type('#password', settings.pw)
  //     .click('#login-button')
  //     .enterIframe('#top_frame')
  //     .click('a[name=my_listings]')
  },

  contNightmare: async function () {
    // const Ids = await window.nightmare
    //   .enterIframe(['#top_frame', '#view_frame'])
    //   .wait('#thegridbody .listing')
    //   .getAll('#thegridbody .listing').attribute('id')

    Meteor.call('updateLechuga', Ids.length, () => {
      console.log('lechuga updated!!!');
    })
  },

  render () {

    const state = this.props.state

    function DateVE (date) {
      return date.toLocaleDateString('es-VE', {
        hour: 'numeric', minute: 'numeric', hour12: true
      })
    }

    function formatRate (int) {
      return new Intl.NumberFormat('es-VE').format(int) + ' bs/usd'
    }

    return (<div class="ui middle aligned grid">

      <div class="left floated five wide column">
        <b>Ingrese Nuevo Precio Lechuga</b> <br></br>
        <div class="ui action input">
          <input type="text" ref='input' placeholder="Nuevo Precio"/>
          <div class="ui primary button" onClick={this.updateLechuga}>
            Update usd
          </div>
          <div class="ui green button" onClick={this.openNightmare}>
            Open nightmare
          </div>
          <div class="ui brown small button" onClick={this.contNightmare}>
            Continue nightmare instance and meteor integration
          </div>
        </div>
      </div>

      {
        state.lechuga.hasOwnProperty('price') ?
          <div id="updatedInfo" class="right floated right aligned six wide column">
            <span>
              <b>Precio de Lechuga: {formatRate(state.lechuga.price)}</b>
              <br/>
              Actualizada: {DateVE(state.lechuga.updatedAt)}
            </span>
          </div>
          : null
      }

    </div>)
  }
}))

export default Input

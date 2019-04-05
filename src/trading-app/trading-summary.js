import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class TradingSummaryApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        .card{
            margin:0 auto;
            padding:25px;
            width:600px;
            borde-radius:5px;
            border:1px #ccc solid;
        }
      </style>
     
      <div class="card">
        Stock Name
      </div>
    `;
  }
  static get properties() {
    return {
      userList: {
        type: Array,
        value: [{"uId":1,"name":"user1"}]
      }
    };
  }

}

window.customElements.define('trading-summary', TradingSummaryApp);
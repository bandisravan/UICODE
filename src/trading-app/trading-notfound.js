import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class TradingNotFoundApp extends PolymerElement {
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
      Page Not Found. Please redirect to <a href='/home'>Home</a>
      </div>
    `;
  }
}

window.customElements.define('trading-notfound', TradingNotFoundApp);
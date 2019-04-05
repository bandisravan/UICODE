import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/app-storage/app-localstorage/app-localstorage-document.js';

class TradingLoginApp extends PolymerElement {
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
      <app-localstorage-document key="user" data="{{user}}">
      </app-localstorage-document>
      <div class="card">
        <paper-dropdown-menu label="Select User" id="userSelect">
      <paper-listbox slot="dropdown-content" selected="0">
      <template is="dom-repeat" items="[[userList]]">
        <paper-item value="[[item.uId]]">[[item.name]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>
    <paper-button raised on-click="goBuy">Go</paper-button>
      </div>
    `;
  }
  static get properties() {
    return {
      userList: {
        type: Array,
        value: [{"uId":1,"name":"user1"}]
      },
      user:{
          type:Object
      }
    };
  }

  goBuy(){
      //this.user = {'name':this.$.userSelect.selectedItemLabel, "userId":""}
      let selItem = this.$.userSelect;
      let uName = selItem.textContent;
      let uId =selItem.getAttribute('value');
      this.user = {'name':this.$.userSelect.selectedItemLabel, "userId":1}
      this.set('route.path','/buy');
  }

}

window.customElements.define('trading-login', TradingLoginApp);
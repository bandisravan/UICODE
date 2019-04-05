import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/app-storage/app-localstorage/app-localstorage-document.js';

setPassiveTouchGestures(true);
setRootPath(MyAppGlobals.rootPath);
/**
 * @customElement
 * @polymer
 */
class TradingApp extends PolymerElement {
  constructor(){
    super();
  }
  ready(){
    super.ready();
  }
  connectedCallback(){
    super.connectedCallback();
  }
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        app-header{
            border-bottom:1px #eee solid;
            background:#ff6000; 
            color:#fff;
        }
        app-header a{
          color:#ffffff;
          text-decoration:none;
          text-transform:uppercase;
          font-family:'Roboto', 'Noto', sans-serif;
        }
        app-header a:after{
          content:""; 
          padding:0 10px;         
        }
      </style>
      <app-location route="{{route}}"  url-space-regex="^[[rootPath]]"></app-location>
      <app-route route="{{route}}" pattern="/:page" data="{{routeData}}"></app-route> 
      <app-localstorage-document key="userData" data="{{userData}}" storage="window.localStorage"></app-localstorage-document>
       
      <app-header-layout>
            <app-header slot="header">
                <app-toolbar>
                  <div main-title>ING Online Trader</div> 
                  <iron-selector selected="[[page]]" attr-for-selected="name">
                    <a name="home" href="[[rootPath]]home">Home</a>
                      <a name="buy" href="[[rootPath]]buy">Purchase</a>
                      <a name="history" href="[[rootPath]]history">History</a>
                  </iron-selector>               
                </app-toolbar>
            </app-header>
        </app-header-layout>
        <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
          <trading-login name="home" route="{{route}}"></trading-login>
          <trading-buy name="buy" route="{{route}}"></trading-buy>
          <trading-history name="history" route="{{route}}"></trading-history>
          <trading-notfound name="notFound" route="{{route}}"></trading-notfound>
        </iron-pages>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'trading-app'
      },
      page: {
          type:String,
          reflectToAttribute:true,
          observer:"_pageChanged"
      },
      routeData: Object
    };
  }
  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }
  
  _routePageChanged(page) {
    if (!page) {
      this.page = 'home';
    }else if (['home','buy', 'summary','history'].indexOf(page) !== -1) {
      this.page = page;
    } else {
      this.page = 'notFound';
    }
  }
    _pageChanged(page) {
    switch (page) {
      case 'home':
        import('./trading-login.js');
        break;
      case 'buy':
        import('./trading-buy.js');
        break;
      case 'summary':
        import('./trading-summary.js');
        break;
      case 'history':
        import('./trading-history.js');
        break;
      case 'notFound':
        import('./trading-notfound.js');
        break;
    }
  }

}

window.customElements.define('trading-app', TradingApp);

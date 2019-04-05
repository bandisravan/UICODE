import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column.js';
import '@polymer/iron-ajax/iron-ajax.js';

class TradingHistoryApp extends PolymerElement {
    constructor(){
    super();
  }
  ready(){
    super.ready();
  }
  connectedCallback(){
    super.connectedCallback();
    this.$.historyAjax.generateRequest();
  }
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        .card{
            margin:0 auto;
            padding:25px;
            borde-radius:5px;
            border:1px #ccc solid;
        }
      </style>
      <iron-ajax
          id="historyAjax"
          url="http://13.126.214.15:9090/api/v1/viewHistory/1"
          handle-as="json"
          method="GET"
          on-response="_handleHistoryResponse">
      </iron-ajax>
      <div class="card">
        <vaadin-grid id="historyGrid" items="[[historyList]]">      

        <vaadin-grid-sort-column width="9em" header="Stock name" path="stockName"></vaadin-grid-sort-column>
        <vaadin-grid-sort-column width="9em" header="Stock price" path="stockPrice"></vaadin-grid-sort-column>
        <vaadin-grid-sort-column width="9em" header="Volume purchased" path="quantity"></vaadin-grid-sort-column>
        <vaadin-grid-sort-column width="9em" header="Total stock purchase price" path="totalStockPurchasePrice"></vaadin-grid-sort-column>
        <vaadin-grid-sort-column width="9em" header="Fees" path="totalFees"></vaadin-grid-sort-column>
        <vaadin-grid-sort-column width="9em" header="Total including fees" path="totalIncludingFee"></vaadin-grid-sort-column>
    </vaadin-grid>
      </div>
    `;
  }
  static get properties() {
    return {
      historyList: {
        type: Array
      }
    };
  }

  _handleHistoryResponse(e){
      this.historyList =e.detail.response;
  }

}

window.customElements.define('trading-history', TradingHistoryApp);
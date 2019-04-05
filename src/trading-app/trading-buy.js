import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/app-storage/app-localstorage/app-localstorage-document.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-ajax/iron-ajax.js';

class TradingBuyApp extends PolymerElement {
    constructor(){
        super();
    }
    ready(){
        super.ready();
    }
    connectedCallback(){
        super.connectedCallback();
        this.$.stockQuantity.addEventListener('change', function(event) { 
            let quantity = event.target.value;  
            let quote = this.stockPrice * quantity;
            let stockQuote = parseFloat(quote).toFixed(3);
            this.stockQuote = stockQuote;
            let fees;
            if(quantity < 500){
               fees =  quantity*0.10;
            }else if(quantity >= 500){
               let totalHun = parseFloat(quantity/100);
               fees = totalHun*0.15;
            }
            fees = parseFloat(fees).toFixed(3);
            this.fees = fees;
            this.totalPurchasePrice = stockQuote;
            this.$.stockQuoteDetails.innerHTML = 'Quote: Rs '+this.totalPurchasePrice;
            debugger;
        }.bind(this));

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
            width:600px;
            borde-radius:5px;
            border:1px #ccc solid;
        }
        #notifyMsg{
            background:green;
        }
      </style>
      <iron-ajax
          auto
          url="http://10.117.189.186:8080/api/v1/stock"
          handle-as="json"
          method="GET"
          on-response="_handleStockResponse">
      </iron-ajax>
      
      <iron-ajax
          id="stockPriceAjax"
          url="https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=PNB&apikey=TJH78Y0TF89JM899"
          handle-as="json"
          method="GET"
          on-response="_handleStockPriceResponse">
      </iron-ajax>

      <div class="card">
      <h2>Purchase Stock</h2>
        <iron-form id="purchaseForm">
      <form>
      
    <div>
      <paper-dropdown-menu label="Select Stock" id="stockSelect"  on-iron-select="_stockSelected" required>
      <paper-listbox slot="dropdown-content" selected="{{selectedStock}}">
      <template is="dom-repeat" items="[[stockList]]">
        <paper-item value="[[item.stockId]]">[[item.name]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>
    </div>
    <div id="stockDetails"></div>
    <paper-input type="text" name="stockQuantity" id="stockQuantity" auto-validate required label="Stock Quantity" error-message="Enter Stock Quantity" min="1"></paper-input>
     <div id="stockQuoteDetails"></div>
    <br />
    <paper-button raised on-click="_submitConfirm">Confirm</paper-button>
    <paper-button raised on-click="_submitCancel">Cancel</paper-button>
      </form>
    </iron-form>
      </div>
      <paper-toast text="Submitted Successfully" id="notifyMsg" horizontal-align="right">
</paper-toast>
    `;
  }
  static get properties() {
    return {
      stockList:{
          type:Object,
          value:{}
      },
       stockName:{
          type:String
      },
      stockId:{
          type:Number,
          notify:true
      },
      stockPrice:{
          type:Number
      },
      stockData:{
          type:Array,
          value:[]
      },
      stockQuote:{
          type:Number
      },
      fees:{
          type:Number
      },
      totalPurchasePrice:{
          type:Number
      }
    };
  }

  _handleStockResponse(e){
      this.set('stockList',e.detail.response);
      
  }
  _handleStockPriceResponse(e){
      //this.set('stockList',e.detail.response);
      this.stockPrice = e.detail.response['Global Quote']['05. price']; 
      this.push('stockData',this.stockData);
      this.$.stockDetails.innerHTML = 'Stock Price: Rs '+this.stockPrice;
      
  }
  _stockSelected(e){
      let selItem = e.target.selectedItem;
      this.stockName = selItem.textContent;
      this.stockId =selItem.getAttribute('value');
      this.$.stockPriceAjax.generateRequest();
  }
   

}

window.customElements.define('trading-buy', TradingBuyApp);
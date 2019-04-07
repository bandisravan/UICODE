import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/app-storage/app-localstorage/app-localstorage-document.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@vaadin/vaadin-accordion/vaadin-accordion.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-dialog/paper-dialog.js';

class TradingStocksApp extends PolymerElement {
    constructor(){
        super();
    }
    ready(){
        super.ready();
    }
    connectedCallback(){
        super.connectedCallback();
        this.$.purchaseForm.reset();
       /* this.$.stockQuantity.addEventListener('change', function(event) { 
            //calculate the total price
            this.calculateTotalPrice(event.target.value);  
                      
        }.bind(this));*/
        this.$.purchaseForm.addEventListener('iron-form-submit',function(e){
            let ajaxEle = this.$.purchaseAjax;
            ajaxEle.contentType = "application/json";
            let curData = new Date();
            let current = curData.getFullYear()+' '+(curData.getMonth()+1)+' '+curData.getDate()+' '+curData.getHours()+':'+curData.getMinutes()+':'+curData.getSeconds();
            //this.calculateTotalPrice(this.stockQuantityVal);
            let data = { 
                "stockId":this.stockId,
                "stockName" : this.stockName,
                "userId":1,
                "quantity" : parseFloat(this.stockQuantityVal),
                "stockPrice" :parseFloat(this.stockPrice),
                "totalStockPurchasePrice":parseFloat(this.stockQuote),
                "totalFees" :parseFloat(this.fees),
                "totalIncludingFee":parseFloat(this.totalPurchasePrice),
                "tradedTime": current
                };
                ajaxEle.body = JSON.stringify(data);
                ajaxEle.generateRequest();

            
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
        #note{
            color:#ff6200;
        }
      </style>
      <!-- [[_getConfigData('stock')]] -->
      <iron-ajax
          auto
          url="{{_getConfigData('stock')}}"
          handle-as="json"
          method="GET"
          on-response="_handleStockResponse">
      </iron-ajax>
      
      <iron-ajax
          id="stockPriceAjax"
          url="https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=[[stockName]]&apikey=TJH78Y0TF89JM899"
          handle-as="json"
          method="GET"
          on-response="_handleStockPriceResponse">
      </iron-ajax>
<iron-ajax
          id="getQuoteAjax"
          url="{{_getConfigData('getQuote')}}"
          handle-as="json"
          method="POST"
          on-response="_handleGetQuoteResponse"
          content-type="application/json">
      </iron-ajax>
      
      <iron-ajax
          id="purchaseAjax"
          url="{{_getConfigData('submit')}}"
          handle-as="json"
          method="POST"
          on-response="_handlePurchaseResponse"
          content-type="application/json">
      </iron-ajax>

      
      <div id="stocksListView"  class="card">
      <h2>List of Stocks</h2>
      <table style="border:1px #solid #000; width:600px;">
        
        <vaadin-accordion>
        <template is="dom-repeat" items="[[stockList]]">
        <tr style="border:1px #solid #000; width:600px;">
        <td style="border:1px #solid #000; width:600px;">
        <vaadin-accordion-panel opened$=[[openedFlag]]>
        <div slot="summary"  on-click="_getStockDetails" stock="[[item.stockId]]" id="[[item.name]]">[[item.name]]</div>
        <span style="display:none;">[[item.stockId]]</span>
        <div id="note">
      ***Stock prices change regularly and the quote is subject to change.  The order will be placed with the live price at the time of submission. 
      </div>
        <div id="stockDetails"></div>

        <paper-input type="text" name="stockQuantity" id="stockQuantity" auto-validate required label="Stock Quantity" error-message="Enter Stock Quantity" min="1"></paper-input>
        <paper-button raised on-click="_getQuote">Get Quote</paper-button>
        <div id="stockQuoteDetails"></div>



    <paper-button raised on-click="_submitConfirm">Confirm</paper-button>
    <paper-button raised on-click="_submitCancel">Cancel</paper-button>

        </vaadin-accordion-panel>
        </td>
        </tr>
        </template>      
        
        </vaadin-accordion>
      </table>
      
      </div>
<paper-dialog id="actions" style="padding:20px;">
Stock latest price is Rs: [[totalPurchasePrice]]. Do you want to continue?
    <div class="buttons">
    <paper-button dialog-dismiss>NO</paper-button>
    <paper-button autofocus on-click="_submitStockPurchase">YES</paper-button>
  </div>
</paper-dialog>

<paper-dialog id="showSummary" style="padding:20px;">
<div >
<p>Purchased Successfully.</p> <p>Stock Name: [[stockName]]</p><p>Stock Purchase Price: [[totalPurchasePrice]]</p>
    </div>
      </div>
    <div class="buttons">
    <paper-button dialog-dismiss>OK</paper-button>
  </div>
</paper-dialog>
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
      stockQuantityVal:{
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
      },
      openedFlag:{
          type:Boolean,
          value:false
      },
      quoteFlag:{
          type:String
      }
    };
  }

  _getConfigData(path){
    return config.baseURL + '/' + path;
  }
  _handleStockResponse(e){
      this.set('stockList',e.detail.response);
      
  }
  _handleStockPriceResponse(e){
      this.stockPrice = e.detail.response['Global Quote']['05. price']; 
      this.push('stockData',this.stockData);
      this.$.stocksListView.querySelector('#stockDetails').innerHTML = 'Stock Price: Rs '+this.stockPrice;
      
  }
  _getQuote(e){
      this.quoteFlag = 'getquote';
      this.stockQuantityVal = this.$.stocksListView.querySelector('paper-input').value;
      this.stockId = this.$.stocksListView.querySelector('span').textContent;
      let data = {
        "stockId":this.stockId,
        "stockName": this.stockName,
        "stockPrice": this.stockPrice,
        "quantity": this.stockQuantityVal
        }
        this.$.getQuoteAjax.contentType = 'application/json';
       this.$.getQuoteAjax.body =JSON.stringify(data); 

  this.$.getQuoteAjax.generateRequest();

  }
  _handleGetQuoteResponse(e){
      let resp = e.detail.response;
      this.totalPurchasePrice = parseFloat(resp.totalIncludingFee).toFixed(4);
      let quote = this.stockPrice * this.stockQuantityVal;
      let stockQuote = parseFloat(quote);
      this.stockQuote = stockQuote;//parseFloat(resp.totalIncludingFee);
      this.fees = 10; //parseFloat(resp.totalFees);
      this.$.stocksListView.querySelector('#stockQuoteDetails').innerHTML = 'Quote (including brokerage)'+this.totalPurchasePrice;
      if(this.quoteFlag == 'confirm'){

      }

  }
  _stockSelected(e){
      let selItem = e.target.selectedItem;
      this.stockName = selItem.textContent;
      this.stockId =selItem.value;
      this.$.stockPriceAjax.generateRequest();
  }

  _getStockDetails(e){
      this.stockName = e.target.getAttribute('id');
      this.$.stockPriceAjax.generateRequest();
  }
  _submitCancel(){
      //this.$.purchaseForm.reset();
      this.$.stocksListView.querySelector('paper-input').value = null;
      this.$.stocksListView.querySelector('#stockQuoteDetails').innerHTML='';
      this.$.stocksListView.querySelector('#stockDetails').innerHTML = '';
  }
  _submitConfirm(e){
      this.quoteFlag = 'confirm';
      this.$.actions.toggle();
  }
  _handlePurchaseResponse(e){
      this.$.actions.toggle();
      this.$.showSummary.toggle();
      this._submitCancel();
  }

  _submitStockPurchase(e){
      let ajaxEle = this.$.purchaseAjax;
            ajaxEle.contentType = "application/json";
            let curData = new Date();
            let current = curData.getFullYear()+'-'+(curData.getMonth()+1)+'-'+curData.getDate()+' '+curData.getHours()+':'+curData.getMinutes()+':'+curData.getSeconds();
            
            let data = { 
                "stockId":this.stockId,
                "stockName" : this.stockName,
                "userId":1,
                "quantity" : parseFloat(this.stockQuantityVal),
                "stockPrice" :parseFloat(this.stockPrice),
                "totalStockPurchasePrice":parseFloat(this.stockQuote),
                "totalFees" :parseFloat(this.fees),
                "totalIncludingFee":parseFloat(this.totalPurchasePrice),
                "tradedTime": current
                };
                ajaxEle.body = JSON.stringify(data);
                ajaxEle.generateRequest();
  }
   

}

window.customElements.define('trading-stocks', TradingStocksApp);
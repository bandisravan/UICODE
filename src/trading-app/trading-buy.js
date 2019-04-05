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
        this.$.purchaseForm.reset();
        this.$.stockQuantity.addEventListener('change', function(event) { 
            //calculate the total price
            this.calculateTotalPrice(event.target.value);  
                      
        }.bind(this));
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
      <iron-ajax
          auto
          url="http://13.126.214.15:9090/api/v1/stock"
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
          id="purchaseAjax"
          url="http://13.126.214.15:9090/api/v1/submit"
          handle-as="json"
          method="POST"
          on-response="_handlePurchaseResponse"
          content-type="application/json">
      </iron-ajax>
      <div id="formView" class="card">
      <h2>Purchase Stock</h2>
      <div class="showForm" id="showForm">
        <iron-form id="purchaseForm" >
      <form>
      <div id="note">
      ***Stock prices change regularly and the quote is subject to change.  The order will be placed with the live price at the time of submission.  To help customers with this we will provide a ‘Re-Quote’ option to get the latest price.
      </div>
      
    <div>
      <paper-dropdown-menu label="Select Stock" id="stockSelect" on-iron-select="_stockSelected" required>
      <paper-listbox slot="dropdown-content">
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
    <div id="showSummary" style="display:none;">
<p>Purchased Successfully.</p> <p>Stock Name: [[stockName]]</p><p>Stock Purchase Price: [[totalPurchasePrice]]</p>
    </div>
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
      this.stockId =selItem.value;
      this.$.stockPriceAjax.generateRequest();
  }
  _submitCancel(){
      this.$.purchaseForm.reset();
      this.$.stockQuoteDetails.innerHTML='';
      this.$.stockDetails.innerHTML = '';
  }
  _submitConfirm(e){
      if(this.$.purchaseForm.validate()){
          this.$.purchaseForm.submit();
      }
  }

  calculateTotalPrice(data){
      let quantity = data;  
      this.stockQuantityVal = quantity;
            let quote = this.stockPrice * quantity;
            let stockQuote = parseFloat(quote);
            this.stockQuote = stockQuote;
            let fees;
            if(quantity < 500){
               fees =  quantity*0.10;
            }else if(quantity >= 500){
               let totalHun = parseFloat(quantity/100);
               fees = totalHun*0.15;
            }
            fees = parseFloat(fees);
            this.fees = fees;
            this.totalPurchasePrice = (parseFloat(stockQuote)+parseFloat(fees)).toFixed(3);
            this.$.stockQuoteDetails.innerHTML = 'Quote (including brokerage): Rs '+this.totalPurchasePrice;   
  }
  _handlePurchaseResponse(e){
      this.$.showForm.style.display="none";
      this.$.showSummary.style.display="block";
  }
   

}

window.customElements.define('trading-buy', TradingBuyApp);
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
import * as d3 from "d3";

class TradingStocksApp extends PolymerElement {
    constructor(){
        super();
    }
    ready(){
        super.ready();
    }
    connectedCallback(){
        super.connectedCallback();
        this.barChartAnalytics(this.$.dayAnalytics,"Day Analytics",this.dayAnalyticsData,'Stocks');
        //this.barChartAnalytics(this.$.hourAnalytics,"Hour Analytics",this.hourAnalyticsData,'Stocks');
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
        .quoteBtn{
            background:#ff6200;
            color:#fff;
        }
        
        .bar {
            fill: steelblue;
        }
      </style>
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
      
<iron-ajax auto
          id="getHourAjax"
          url="{{_getConfigData('hourlyCount')}}"
          handle-as="json"
          method="GET"
          on-response="_handleGetHourResponse"
          content-type="application/json">
      </iron-ajax>

      <iron-ajax 
          id="getDayAjax"
          url="{{_getConfigData('dayCount')}}"
          handle-as="json"
          method="GET"
          on-response="_handleGetDayResponse"
          content-type="application/json">
      </iron-ajax>

      
      <div id="stocksListView"  class="card">
      <h2>List of Stocks</h2>
      <table style="border:1px #solid #000; width:600px;">
        
        <vaadin-accordion>
        <template is="dom-repeat" items="[[stockList]]">
        <tr style="1px #000 solid !important; width:600px;">
        <td style="1px #000 solid !important; width:600px;">
        <vaadin-accordion-panel opened$=[[openedFlag]] style="border:1px #ccc solid;padding:10px;">
        <div slot="summary"  on-click="_getStockDetails" stock="[[item.stockId]]" id="[[item.name]]">[[item.name]]</div>
        <span style="display:none;">[[item.stockId]]</span>
        <div id="note">
      ***Stock prices change regularly and the quote is subject to change.  The order will be placed with the live price at the time of submission. 
      </div>
        <div id="stockDetails">
        <p>Stock Price: Rs [[stockPrice]]</p>
        <p>Stock Open Price: [[stockOpen]]</p>
        <p>Stock High Price: [[stockHigh]]</p>
        <p>Stock Low Price: [[stockLow]]</p>
        <p>Stock Previous Close Price: [[stockPrevClose]]</p>
        </div>
        <iron-form id="purchaseForm">
        <form>
        <paper-input type="text" name="stockQuantity" id="stockQuantity" auto-validate required label="Stock Quantity" error-message="Enter Stock Quantity" min="1"><paper-button slot="suffix" class="quoteBtn" raised on-click="_getQuote">Get Quote</paper-button></paper-input>
        
        </p>
        <div id="stockQuoteDetails">
        <p>Quote (including brokerage) Rs: [[totalPurchasePrice]]</p>
        </div>
    <paper-button raised on-click="_submitConfirm" disabled$=[[disabledBtn]]>Confirm</paper-button>
    <paper-button raised on-click="_submitCancel">Cancel</paper-button>
    </form>
    <iron-form>
        </vaadin-accordion-panel>
        </td>
        </tr>
        </template>      
        
        </vaadin-accordion>
      </table>
      
      </div>

      <div class="analytics card">
      <svg width="600" height="500" id="dayAnalytics"></svg> 
       <svg width="600" height="500" id="hourAnalytics"></svg> 
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
      },
      stockOpen:{
          type:String
      },
      stockHigh:{
          type:String
      },
      stockLow:{
          type:String
      },
      stockPrevClose:{
          type:String
      },
      disabledBtn:{
          type:Boolean,
          value:true
      },     
      dayAnalyticsData:{
                type:Array,
                value:[{'stockname':"HCL",'quantity':100},
                {'stockname':"ING",'quantity':100},
                {'stockname':"PNB",'quantity':290},
                {'stockname':"MSFT",'quantity':500},
                {'stockname':"SBI",'quantity':650}]
    },
            
    hourAnalyticsData:{
        type:Array,
        value:[{'stockname':"HCL",'quantity':100},
                {'stockname':"ING",'quantity':100},
                {'stockname':"PNB",'quantity':230},
                {'stockname':"MSFT",'quantity':500},
                {'stockname':"SBI",'quantity':650}]
    }
    };
  }

  _getConfigData(path){
    return config.baseURL + '/' + path;
  }
  _handleStockResponse(e){
      this.set('stockList',e.detail.response);
      //this._getStockDetails();

      
  }
  _handleStockPriceResponse(e){
      this.stockPrice = e.detail.response['Global Quote']['05. price']; 
      this.stockOpen = e.detail.response['Global Quote']['02. open']; 
      this.stockHigh = e.detail.response['Global Quote']['03. high']; 
      this.stockLow = e.detail.response['Global Quote']['04. low']; 
      this.stockPrevClose = e.detail.response['Global Quote']['08. previous close']; 
      this.push('stockData',this.stockData);
      //this.$.stocksListView.querySelector('#stockDetails').style = 'Stock Price: Rs '+this.stockPrice;
      
  }
  _getQuote(e){
      this.quoteFlag = 'getquote';
      let quantityVal = e.target.parentElement.value;
     // if(this.$.stocksListView.querySelector('iron-form').validate()){
         if(quantityVal){
          this.stockQuantityVal = e.target.parentElement.value;
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
      

  }
  _handleGetQuoteResponse(e){
      let resp = e.detail.response;
      this.totalPurchasePrice = parseFloat(resp.totalIncludingFee).toFixed(4);
      let quote = this.stockPrice * this.stockQuantityVal;
      let stockQuote = parseFloat(quote);
      this.stockQuote = stockQuote;
      this.disabledBtn =false;//parseFloat(resp.totalIncludingFee);
      this.fees = 10; //parseFloat(resp.totalFees);
      //this.$.stocksListView.querySelector('#stockQuoteDetails').innerHTML = 'Quote (including brokerage)'+this.totalPurchasePrice;
    //   if(this.quoteFlag == 'confirm'){

    //   }

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
     /* this.$.stocksListView.querySelector('paper-input').value = null;
      this.$.stocksListView.querySelector('#stockQuoteDetails').innerHTML='';
      this.$.stocksListView.querySelector('#stockDetails').innerHTML = '';*/
      this.$.stocksListView.querySelector('iron-form').reset();
      this.openedFlag = false;
      this.disabledBtn =true;
  }
  _submitConfirm(e){
      this.quoteFlag = 'confirm';
      //if(e.target.parentElement.validate()){
          //if(e.target.parentElement.querySelector('paper-input').value){
              this.$.actions.toggle();
          //}
      
      //}
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
  _handleGetHourResponse(e){   
      this.hourAnalyticsData = e.detail.response.stockcountlist;
       this.barChartAnalytics(this.$.hourAnalytics,"Hour Analytics",this.hourAnalyticsData,'Stocks');
  }
  _handleGetDayResponse(e){     
      this.dayAnalyticsData = e.detail.response.stockcountlist;
        this.barChartAnalytics(this.$.dayAnalytics,"Day Analytics",this.dayAnalyticsData,'Stocks');
  }

      barChartAnalytics(selectedId,chartText,chartData,xScaleTxt){
        var svg = d3.select(selectedId),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;
const color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text(chartText)

    var xScale = d3.scaleBand().range([0, width]).padding(0.4),
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
               .attr("transform", "translate(" + 100 + "," + 100 + ")");    
        
        var data = chartData;
       
        xScale.domain(data.map(function(d) { return d.stockname; }));
        yScale.domain([0, d3.max(data, function(d) { return d.quantity; })]);

        g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(xScale))
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text(xScaleTxt);

        g.append("g")
         .call(d3.axisLeft(yScale).tickFormat(function(d){
             return d;
         })
         .ticks(10))
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
         .attr("dy", "-5.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Quantity");

        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("x", function(d) { return xScale(d.stockname); })
         .attr("y", function(d) { return yScale(d.quantity); })
         .attr("width", xScale.bandwidth())         
         .attr("fill", function(g,i) { return color(i); })
         .attr("height", function(d) { return height - yScale(d.quantity); });
    
    }
   

}

window.customElements.define('trading-stocks', TradingStocksApp);
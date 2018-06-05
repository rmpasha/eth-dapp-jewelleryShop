//Author: Rajendra Maharjan
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Calling Json file for all items to bind
    $.getJSON('../jewellery.json', function(data) {
      var itemsRow = $('#itemsRow');
      var itemTemplate = $('#itemsTemplate');

      for (i = 0; i < data.length; i ++) {
        itemTemplate.find('.panel-title').text(data[i].name);
        itemTemplate.find('img').attr('src', data[i].picture);
        itemTemplate.find('.item-type').text(data[i].type);
        itemTemplate.find('.item-price').text(data[i].price);
        itemTemplate.find('.item-material').text(data[i].material);
        itemTemplate.find('.btn-purchase').attr('data-id', data[i].id);
        itemsRow.append(itemTemplate.html());
      }
    });

    ////////////////////////////Listening for selected account change every 100 millisecond//////////////
    var curAccount = web3.eth.accounts[0];
    var accountInterval = setInterval(function() {
      if(web3.eth.accounts[0] !== curAccount) {
        curAccount=web3.eth.accounts[0];
        //updateInterface();
        return App.displayAddressBalance();
      }
    },100);
    /////////////////////////////////////////////////////////////////////////////

    return App.initWeb3();
  },

  initWeb3: function() {
   
    //Using Infura///////////////////////////////////////////////////////////////
    //var web3 = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws"));
    /////////////////////////////////////////////////////////////////////////
    //Connecting to Network provider
    if(typeof web3 !== 'undefined') {
      //MetaMask connects from this block
      App.web3Provider = web3.currentProvider;
      console.log("Automatically picked Provider: " + App.web3Provider);
    } else {
      //Forcing to connect Local Network if not defined from above block
      //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      //console.log("Direct localhost Provider:" + App.web3Provider);
      Console.log("MetaMast or MIST has not been installed");
      alert("Please installl Ethereum Browser (MIST or MetaMask)");
    }

    web3 = new Web3(App.web3Provider);

    //Get web3 version
    var version = web3.version.api;
    console.log("Web3 API version : " + version); // "0.20.3"



    /////////////////// To know Which Network Connected From MataMask //////////////////////
    web3.version.getNetwork((err,netId) => {
      switch (netId) {
        case "1":
          console.log('This is mainnet' + netId);
          break;
        case "2":
          console.log('This is the deprecated Morden test network.'+ netId);
          break;
        case "3":
          console.log('This is the ropsten test network');
          break;
        case "1527864774980":
          console.log('This is local network');
          break;
        default:
          console.log('This is an unknown network '+ netId);
      }
    });
    ////////////////////////////////////////////////////////////////////////////////////////
    
  ////////////////////////////Get Block if need////////////////////////////////////////
  /*  web3.eth.getBlock(4, function(error, result){
    if(!error)
        console.log(JSON.stringify(result));
    else
        console.error("GetBlock Error: " + error); 
  });
  */
  //////////////////////////////////////////////////////////////////////////////////////////////
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('PurchaseJewellery.json', function(data){
      var purchaseArtifact = data;
      App.contracts.PurchaseJewellery = TruffleContract(purchaseArtifact);
      //Set the provider for this contract
      App.contracts.PurchaseJewellery.setProvider(App.web3Provider);

      return App.markAsPurchased();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
  },

  markAsPurchased: function(buyers, account) {
     var purchaseInstance;

     App.contracts.PurchaseJewellery.deployed().then(function(instance) {
       purchaseInstance = instance;

//getAllBuyers return as view, use call method
       return purchaseInstance.getAllBuyers.call(); 
     }).then(function(buyers){
       for(i=0;i<buyers.length;i++){
         if(buyers[i] !== '0x0000000000000000000000000000000000000000') {
           $('.panel-item').eq(i).find('button').text('Success').attr('disabled',true);
         }
       }
     }).catch(function(err){
       console.log(err.message);
     });
  },

  //Function to display current eth address and it's balance
  displayAddressBalance: function() {
    ////////////////////////////////////Get MetaMask Current Address///////////////////////
    web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log("Getting Account: " + error);
      }
      else {
        var account = accounts[0];
        $('#ethAddress').text(account);
      }
    ///////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////Get Current Balance///////////////////////////////////////
      //var balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]));
      //Above commented line doesn't work here, we need to use synchronous callback 
      //as below to get the balance of MetaMask Wallet Address
      web3.eth.getBalance(account, function(error, result){
        if(!error)  {
          //console.log("Balance: " + result/1000000000000000000);
          $('#ethBalance').text(result/1000000000000000000);
        }
        else
          console.log("Error: " + error);
      });
    });
  ////////////////////////////////////////////////////////////////////////////////////////
  },

  handlePurchase: function(event) {
    event.preventDefault();

    var itemId = parseInt($(event.target).data('id'));
    var itemPrice;
    //Implementing Price
    //Get Item Price from json file
    $.getJSON('../jewellery.json', function(data) {
      itemPrice=data[itemId].price;
       //console.log("Price from json: " + data[itemId].price);
    //});
    
    var purchaseInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.PurchaseJewellery.deployed().then(function(instance) {
        purchaseInstance = instance;
        //Execute Purchase as a  transaction by sending account
        //return purchaseInstance.buyItem(itemId, {from: account, to: '0x79bba8e1299CF25C2d71005bc73F65519c551dA7', value: web3.toWei(itemPriceInEther, 'ether'), gas: 21000});
        return purchaseInstance.buyItem(itemId, {from: account, value: web3.toWei(itemPrice, 'ether'), gas: 100000});
      }).then(function(result){
        return App.markAsPurchased();
      }).catch(function(err){
        console.log(err.message);
      });
    });
  });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

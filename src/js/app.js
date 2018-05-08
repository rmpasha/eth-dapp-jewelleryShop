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

    return App.initWeb3();
  },

  initWeb3: function() {
    //Connecting to Network provider
    if(typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

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

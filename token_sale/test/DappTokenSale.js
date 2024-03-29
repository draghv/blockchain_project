var Dapptoken = artifacts.require('./Dapptoken.sol');
var DappTokenSale = artifacts.require('./DappTokenSale.sol');

contract('DappTokenSale' , function(accounts){
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 100000000000000; // in wei
	var tokensAvailable = 750000;
	var numberOfTokens;

	it('initialises the contract with the correct values' ,  function(){
		return DappTokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address , 0x0 , ' has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address , 0x0 , 'has token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price , tokenPrice , 'token price is correct');
		});
	});

	it('facilitates token buying' , function(){
		return Dapptoken.deployed().then(function(instance){
			//grab token instance first
			tokenInstance=instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			//then grab token sale instance
			tokenSaleInstance = instance;
			//provision 75% of all tokens  to token sale
			return tokenInstance.transfer(tokenSaleInstance.address , tokensAvailable , {from: admin});
		}).then(function(receipt){
			numberOfTokens = 10;
			
			return tokenSaleInstance.buyTokens(numberOfTokens , {from: buyer , value: numberOfTokens*tokenPrice})
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      console.log(receipt.logs[0].event);
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      console.log(receipt.logs[0].args._buyer);
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      console.log(receipt.logs[0].args.amount);
			return tokenSaleInstance.tokensSold();
		}).then(function(amount){
			assert.equal(amount.toNumber() , numberOfTokens , 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(),tokensAvailable - numberOfTokens);
			//try to buy tokens from ether value
			return tokenSaleInstance.buyTokens(numberOfTokens , {from: buyer , value: 1});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0 , 'msg.value must equal number. of tokens in wei');
			return tokenSaleInstance.buyTokens(800000 , {from: buyer , value: numberOfTokens*tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0 , 'cannot purchase more tokens than avilable');
		});
	});
	it('ends token sale' , function(){
		return Dapptoken.deployed().then(function(instance){
			//grab token instance first
			tokenInstance=instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			//then grab token sale instance
			tokenSaleInstance = instance;
			//try to end sale from account other than the admin
			return tokenSaleInstance.endSale({from: buyer});


		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert' >=0 , 'must be admin to token sale'));
			//end sale as admin
			return tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			//receipt
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber() , 999990 , 'returns all tokens to the admin');
			//check when token price was reset when selfdestruct is called
		//	return tokenSaleInstance.tokenPrice();
		//}).then(function(price){
		//	assert.equal(price.toNumber(),0,'token price was reset');//
			return balance = web3.eth.getBalance(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance , 0);
		});
	});
});
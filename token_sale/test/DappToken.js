var Dapptoken = artifacts.require("./Dapptoken.sol");

contract('Dapptoken', function(accounts) {
	var tokenInstance;

  
  it('initialises the contract with the correct values' , function() {
  	return Dapptoken.deployed().then(function(instance){
  		tokenInstance = instance;
  		return tokenInstance.name();
  	}).then(function(name){
  		assert.equal(name  , 'HV token' , 'has the correct name');
  		return tokenInstance.symbol();
  	}).then(function(symbol){
  		assert.equal(symbol , 'HV' , 'has the correct symbol');
  		return tokenInstance.standard();
  	}).then(function(standard){
  		assert.equal(standard , 'HV v1.0' , ' has the correct standard');
  	});
  });
  it('allocates the initial supply upon deployment', function() {
    return Dapptoken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.totalsuply();
    }).then(function(totalsuply) {
      assert.equal(totalsuply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance) {
    	assert.equal(adminBalance.toNumber() , 1000000 , 'it allocates the initial suply to the admin accoount ');
    });
  });
  it('transfers token ownership' , function(){
  	return Dapptoken.deployed().then(function(instance){
  		tokenInstance =  instance;
  		// test "require" statement first by transfering something larger than the sender's balance
  		return tokenInstance.transfer.call(accounts[1] , 99999999999999999999999);
  	}).then(assert.fail).catch(function(error){
  		assert(error.message.indexOf('revert') <=0 , 'error message must contain revert');
      return tokenInstance.transfer.call(accounts[1] , 250000 , {from: accounts[0]});
    }).then(function(success){
      assert.equal(success , true , 'it returns true')
      return tokenInstance.transfer(accounts[1] , 250000 , {from :accounts[0]} );
  	}).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
      
  		return tokenInstance.balanceOf(accounts[1]);
  	}).then(function(balance){
  		assert.equal(balance.toNumber() , 250000 , 'adds the amount to receiver ');
  		return tokenInstance.balanceOf(accounts[0]);
  	}).then(function(balance){
  		assert.equal(balance.toNumber(), 750000 , ' deducts the amount from sender');
  	});
  });

  it('approves tokens for delegated transfer' , function(){
    return Dapptoken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100);
    }).then(function(success){
      assert.equal(success , true , 'it returns true' );
      return tokenInstance.approve(accounts[1] , 100);
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
      return tokenInstance.allowance(accounts[0] , accounts[1]);
    }).then(function(allowance){
      assert.equal(allowance.toNumber() , 100 , 'stores the allowance for delegated transfer');
    });
  });

  it('handles delegated token transfers' , function(){
    return Dapptoken.deployed().then(function(instance){
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      //transfer some tokens to fromAccount
      return tokenInstance.transfer(fromAccount , 100 , {from:accounts[0]});
    }).then(function(receipt){
      //approve spendingAccount to spend 10 tokens from fromAccount
      return tokenInstance.approve(spendingAccount , 10 ,{from: fromAccount});
  }).then(function(receipt){
    //try transferring something larger than the senders balance
    return tokenInstance.transferFrom(fromAccount , toAccount , 9999 , {from : spendingAccount});
  }).then(assert.fail).catch(function(error){
    assert(error.message.indexOf('revert') >= 0 , 'cannot transfer value larger than balance');
    //try transferring something larger than the approved amount
    return tokenInstance.transferFrom(fromAccount , toAccount , 20 , { from: spendingAccount});
  }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0 , 'cannot transfer value larger than approved amounttt');
      return tokenInstance.transferFrom.call(fromAccount , toAccount , 10 , {from: spendingAccount});
  }).then(function(success){
    assert.equal(success , true);
    return tokenInstance.transferFrom(fromAccount , toAccount , 10 , {from: spendingAccount});
  }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
  }).then(function(balance){
    assert.equal(balance.toNumber() , 90 , 'deducts the amount from the spending account');
    return tokenInstance.balanceOf(toAccount);
  }).then(function(balance){
    assert.equal(balance.toNumber() , 10 , 'adds the amount to the receieving account');
    return tokenInstance.allowance(fromAccount , spendingAccount);
  }).then(function(allowance){
    assert.equal(allowance.toNumber() , 0 , 'deducts the amount from the allowance');
  });



});
});
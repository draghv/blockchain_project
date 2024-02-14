var Dapptoken = artifacts.require("./Dapptoken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(Dapptoken , 1000000).then(function(){
  	//price is 0.0001 ether
  	var tokenPrice = 100000000000000;
  	return deployer.deploy(DappTokenSale , Dapptoken.address , tokenPrice);
  });
  //deployer.deploy(DappTokenSale);
};

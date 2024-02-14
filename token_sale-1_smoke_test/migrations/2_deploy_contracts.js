var Dapptoken = artifacts.require("./Dapptoken.sol");

module.exports = function(deployer) {
  deployer.deploy(Dapptoken);
};

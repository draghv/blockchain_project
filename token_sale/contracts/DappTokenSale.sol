pragma solidity ^0.5.0;


import "./Dapptoken.sol";

/**
 * The DappTokenSale contract does this and that...
 */
contract DappTokenSale {
	address payable admin;
	Dapptoken public tokenContract;
	uint256 public tokenPrice = 100000000000000;
	uint256 public tokensSold;

	event Sell(address _buyer , uint256 _amount);


  constructor (Dapptoken _tokenContract , uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }
  // multiply 
  function multiply (uint x , uint y)  internal pure returns(uint z) {
  	
  	require (y == 0 || (z = x*y)/y == x);
  	
  }
  

  //buying tokens
  function buyTokens (uint256 _numberOfTokens) public payable {
  	//require that value is equal to tokens

  	require (msg.value == multiply(_numberOfTokens , tokenPrice));
  	
  	//require that contract has enough tokens

  	require (tokenContract.balanceOf(address(this)) >= _numberOfTokens);
  	
  	//require that a transfer is successful

  	require (tokenContract.transfer(msg.sender , _numberOfTokens));
  	
  	//keep track of number of tokens sold
  	tokensSold +=_numberOfTokens;
  	//trigger sell event
  	emit Sell(msg.sender, _numberOfTokens);
  }
  
  //ending token sale
  function endSale () public {
  	//require admin

  	require (msg.sender == admin);
  	//transfer remaining dapptokens to admin
  	require (tokenContract.transfer(admin , tokenContract.balanceOf(address(this))));
  	
  	

  	//destroy contract
  	//selfdestruct(admin);
  	admin.transfer(address(this).balance);
  }
  
}

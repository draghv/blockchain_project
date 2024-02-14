pragma solidity ^0.5.0;

contract Dapptoken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens

    //name
    string public name = "HV token";
    //symbol
    string public symbol = "HV";
    //standard
    string public standard = "HV v1.0";

    uint256 public totalsuply;

    //approve
    event Approval(
        address indexed _owner , 
        address indexed _spender,
        uint256 _value
        );

    event Transfer(
    	address indexed _from ,
    	address indexed _to,
    	uint256 _value
    	
     );
    
    // transfer


    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;
     
    
    //allowance

    constructor(uint256 initialsupply) public {
    	balanceOf[msg.sender] = initialsupply;
        totalsuply = initialsupply;
    }

    //transfer
    
    function transfer (address _to , uint256 _value) public returns(bool success) 
     {
    	//Exception if account doesnt have enough

    	
    	 require (balanceOf[msg.sender] >= _value);
    	
    	//require(balanceOf[msg.sender] >= _value );
    	balanceOf[msg.sender] -= _value;
    	balanceOf[_to] += _value;

        emit Transfer(msg.sender , _to , _value); 
    	//return boolean
        return true;
    	//transfer event	
    }
 	   


       //approve
    function approve (address _spender , uint256 _value) public returns(bool success) {
        allowance[msg.sender][_spender] = _value;


        emit Approval(msg.sender , _spender , _value);



        return true;
    }
    


       // transferfrom
    function transferFrom (address _from ,address _to , uint256 _value) public returns(bool success)  {
        
        //require _from has enough tokens

        require (_value <= balanceOf[_from]);
        
        //require allowance is big enough

        require (_value <= allowance[_from][msg.sender]);
        
        //change balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //update allowance
        allowance[_from][msg.sender] -= _value;

        //transfer event
        emit Transfer(_from , _to , _value);
        //return boolean
        return true;
    }
    


}
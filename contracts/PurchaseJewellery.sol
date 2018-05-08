pragma solidity ^0.4.23;

contract PurchaseJewellery {
    address public owner;
    address[12] public buyers;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function buyItem(uint itemId) public payable returns(uint) {
        require(itemId >= 0 && itemId < 12);     //Only we have 12 items for sell
        buyers[itemId] = msg.sender;
        //this.balance += 0.5 ether;
        return itemId;
    }

    function getAllBuyers() public view returns (address[12]) {
        return buyers;
    }
}
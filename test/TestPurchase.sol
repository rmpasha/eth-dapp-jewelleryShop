//Author: Rajendra Maharjan
//1. Testing for User can purchase or not
//2. Testing whether it records buyer address or not
//3. Testing whether all buyers return or not.

pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PurchaseJewellery.sol";

contract TestPurchase {
    PurchaseJewellery objPurchase = PurchaseJewellery(DeployedAddresses.PurchaseJewellery());

    function testUserCanPurchase() public {
        uint returnId = objPurchase.buyItem(2);
        uint expected = 2;
        Assert.equal(returnId, expected, "Purchase of item 2nd should be recorded");
    }

    function testGetBuyerByItemId() public {
        address expected = this;
        address buyer = objPurchase.buyers(2);
        Assert.equal(buyer, expected, "Owner of 2nd item should be recorded");
    }
    
    function testGetBuyerAddressByItemIdInArray() public {
        address expected = this;

        address[12] memory buyers = objPurchase.getAllBuyers();

        Assert.equal(buyers[2], expected, "Owner of 2nd Item should be recorded");
    }
    
}

pragma solidity ^0.4.15;


/// @title Contract for testing low-level calls issued from the multisig wallet
contract TestCalls {

	// msg.data.length of the latest call to "receive" methods
	uint public lastMsgDataLength;

	// msg.value of the latest call to "receive" methods
	uint public lastMsgValue;

	uint public uint1;
	uint public uint2;
	bytes public byteArray1;

	modifier setMsgFields {
		lastMsgDataLength = msg.data.length;
		lastMsgValue = msg.value;
		_;
	}

	function TestCalls() setMsgFields public {
		// This constructor will be used to test the creation via multisig wallet
	}

	function receive1uint(uint a) setMsgFields payable public {
		uint1 = a;
	}

	function receive2uints(uint a, uint b) setMsgFields payable public {
		uint1 = a;
		uint2 = b;
	}

	function receive1bytes(bytes c) setMsgFields payable public {
		byteArray1 = c;
	}

	function nonPayable() setMsgFields public {
	}

}
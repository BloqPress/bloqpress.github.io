pragma solidity ^0.4.18;

// Castor = 0x9230705e8c6436539Fe022a7b8816A71a185Fd93
// BloqPress-v0.0.2 = 0x9F1d675b709Cc763AbACF01adcAB4AEfEa2E0d1E

library SafeMath 
{
    function add(uint a, uint b) internal pure returns (uint c) 
    {
        c = a + b;
        require(c >= a);
    }

    function sub(uint a, uint b) internal pure returns (uint c) 
    {
        require(b <= a);
        c = a - b;
    }

    function mul(uint a, uint b) internal pure returns (uint c) 
    {
        c = a * b;
        require(a == 0 || c / a == b);
    }

    function div(uint a, uint b) internal pure returns (uint c) 
    {
        require(b > 0);
        c = a / b;
    }
}

contract AbleToUtilizeStrings
{
    function bytes32ToString(bytes32 x) internal pure returns (string) 
    {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) 
        {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) 
            {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) 
        {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
    
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) 
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) 
        {
            return 0x0;
        }
        assembly 
        {
            result := mload(add(source, 32))
        }
    }
    
    function uintToString(uint i) internal pure returns (string) 
    {
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0)
        {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0)
        {
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }
    
    function combine(string _a, string _b, string _c, string _d, string _e) internal pure returns (string)
    {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }
    
    function char(byte b) internal pure returns (byte c) 
    {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }
    
    function toString(address x) internal pure returns (string) 
    {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) 
        {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }
}

contract Upgradable is AbleToUtilizeStrings
{
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    function Upgradable() public 
    {
        owner = msg.sender;
    }

    modifier onlyOwner() 
    {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner public 
    {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract Database is Upgradable
{   
    // Set Contract Data
    function _setAddress(bytes32 version, bytes32 key, address value) public;
    function _setBool(bytes32 version, bytes32 key, bool value) public;
    function _setString(bytes32 version, bytes32 key, bytes32 value) public;
    function _setUint(bytes32 version, bytes32 key, uint256 value) public;
    // Set Addressed Data
    function _setsAddress(bytes32 version, address addressKey, bytes32 param, address value) public;
    function _setsBool(bytes32 version, address addressKey, bytes32 param, bool value) public;
    function _setsString(bytes32 version, address addressKey, bytes32 param, bytes32 value) public;
    function _setsUint(bytes32 version, address addressKey, bytes32 param, uint256 value) public;
    // Set Token Data
    function _SetAddress(bytes32 version, uint256 key, bytes32 param, address value) public;
    function _SetBool(bytes32 version, uint256 key, bytes32 param, bool value) public;
    function _SetString(bytes32 version, uint256 key, bytes32 param, bytes32 value) public;
    function _SetUint(bytes32 version, uint256 key, bytes32 param, uint256 value) public;
    // Get Contract Data
    function _getAddress(bytes32 version, bytes32 key) public view returns(address);
    function _getBool(bytes32 version, bytes32 key) public view returns(bool);
    function _getString(bytes32 version, bytes32 key) public view returns(bytes32);
    function _getUint(bytes32 version, bytes32 key) public view returns(uint256);
    // Get Addressed Data
    function _getsAddress(bytes32 version, address addressKey, bytes32 param) public view returns(address);
    function _getsBool(bytes32 version, address addressKey, bytes32 param) public view returns(bool);
    function _getsString(bytes32 version, address addressKey, bytes32 param) public view returns(bytes32);
    function _getsUint(bytes32 version, address addressKey, bytes32 param) public view returns(uint256);
    // Get Token Data
    function _GetAddress(bytes32 version, uint256 key, bytes32 param) public view returns(address);
    function _GetBool(bytes32 version, uint256 key, bytes32 param) public view returns(bool);
    function _GetString(bytes32 version, uint256 key, bytes32 param) public view returns(bytes32);
    function _GetUint(bytes32 version, uint256 key, bytes32 param) public view returns(uint256);
    // Get Contract Data Counts
    function _contractAddressCount(bytes32 version) public view returns(uint);
    function _contractBoolCount(bytes32 version) public view returns(uint);
    function _contractStringCount(bytes32 version) public view returns(uint);
    function _contractUintCount(bytes32 version) public view returns(uint);
    // Get Addressed Data Counts
    function _addressAddressCount(bytes32 version, address addressKey) public view returns(uint);
    function _addressBoolCount(bytes32 version, address addressKey) public view returns(uint);
    function _addressStringCount(bytes32 version, address addressKey) public view returns(uint);
    function _addressUintCount(bytes32 version, address addressKey) public view returns(uint);
    // Get Token Data Counts
    function _tokenAddressCount(bytes32 version, uint256 key) public view returns(uint);
    function _tokenBoolCount(bytes32 version, uint256 key) public view returns(uint);
    function _tokenStringCount(bytes32 version, uint256 key) public view returns(uint);
    function _tokenUintCount(bytes32 version, uint256 key) public view returns(uint);
}

contract Proxy is Upgradable
{
    Database proxy;
    bytes32 stakeholder;
    
    using SafeMath for uint;
    
    mapping(address => bool) whitelist;
    mapping(address => bool) blacklist;
    
    uint public whitelistCount;
    uint public blacklistCount;
    
    function Proxy(address databaseAddress, string stakeholderName) public onlyOwner
    {
        stakeholder = stringToBytes32(stakeholderName);
        proxy = Database(databaseAddress);
    }
    
    function updateProxy(address databaseAddress) public onlyOwner
    {
        proxy = Database(databaseAddress);
    }
    
    function updateStakeholder(string stakeholderName) public onlyOwner
    {
        stakeholder = stringToBytes32(stakeholderName);
    }
    
    function getStakeholder() public view returns(string)
    {
        return bytes32ToString(stakeholder);
    }
    
    function addToWhitelist(address Address) public onlyOwner
    {
        require(whitelist[Address] == false);
        whitelist[Address] = true;
        whitelistCount.add(1);
    }
    
    function addToBlacklist(address Address) public onlyOwner
    {
        require(blacklist[Address] == false);
        blacklist[Address] = true;
        blacklistCount.add(1);
    }
    
    function removeFromWhitelist(address Address) public onlyOwner
    {
        require(whitelist[Address] == true);
        whitelist[Address] = false;
        whitelistCount.sub(1);
    }
    
    function removeFromBlacklist(address Address) public onlyOwner
    {
        require(blacklist[Address] == true);
        blacklist[Address] = false;
        blacklistCount.sub(1);
    }
    
    function isOnWhitelist(address Address) public view returns(bool)
    {
        return whitelist[Address];
    }
    
    function isOnBlacklist(address Address) public view returns(bool)
    {
        return blacklist[Address];
    }
    
    function isValidContract(address Address) public view returns(bool)
    {
        return isOnWhitelist(Address);
    }
    
    function isValidUser(address Address) public view returns(bool)
    {
        if(isOnBlacklist(Address) == true)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    
    function isValid(address contractAddress, address userAddress) internal view returns(bool)
    {
        require(msg.sender != tx.origin);
        require(isValidContract(contractAddress) == true);
        require(isValidUser(userAddress) == true);
        return true;
    }
    
    // Set Contract Data
    function setAddress(string key, address value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _key = stringToBytes32(key);
        proxy._setAddress(stakeholder, _key, value);
    }
    function setBool(string key, bool value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _key = stringToBytes32(key);
        proxy._setBool(stakeholder, _key, value);
    }
    function setString(string key, bytes32 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _key = stringToBytes32(key);
        proxy._setString(stakeholder, _key, value);
    }
    function setUint(string key, uint256 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _key = stringToBytes32(key);
        proxy._setUint(stakeholder, _key, value);
    }
    
    // Set Addressed Data
    function setsAddress(address addressKey, string param, address value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._setsAddress(stakeholder, addressKey, _param, value);
    }
    function setsBool(address addressKey, string param, bool value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._setsBool(stakeholder, addressKey, _param, value);
    }
    function setsString(address addressKey, string param, bytes32 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._setsString(stakeholder, addressKey, _param, value);
    }
    function setsUint(address addressKey, string param, uint256 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._setsUint(stakeholder, addressKey, _param, value);
    }
    
    // Set Token Data
    function SetAddress(uint256 key, string param, address value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._SetAddress(stakeholder, key, _param, value);
    }
    function SetBool(uint256 key, string param, bool value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._SetBool(stakeholder, key, _param, value);
    }
    function SetString(uint256 key, string param, bytes32 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._SetString(stakeholder, key, _param, value);
    }
    function SetUint(uint256 key, string param, uint256 value) public
    {
        require(isValid(msg.sender, tx.origin) == true);
        bytes32 _param = stringToBytes32(param);
        proxy._SetUint(stakeholder, key, _param, value);
    }
    
    // Get Contract Data
    function getAddress(string key) public view returns(address)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _key = stringToBytes32(key);
        return proxy._getAddress(stakeholder, _key);
    }
    function getBool(string key) public view returns(bool)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _key = stringToBytes32(key);
        return proxy._getBool(stakeholder, _key);
    }
    function getString(string key) public view returns(bytes32)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _key = stringToBytes32(key);
        return proxy._getString(stakeholder, _key);
    }
    function getUint(string key) public view returns(uint256)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _key = stringToBytes32(key);
        return proxy._getUint(stakeholder, _key);
    }
    
    // Get Addressed Data
    function getsAddress(address addressKey, string param) public view returns(address)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._getsAddress(stakeholder, addressKey, _param);
    }
    function getsBool(address addressKey, string param) public view returns(bool)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._getsBool(stakeholder, addressKey, _param);
    }
    function getsString(address addressKey, string param) public view returns(bytes32)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._getsString(stakeholder, addressKey, _param);
    }
    function getsUint(address addressKey, string param) public view returns(uint256)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._getsUint(stakeholder, addressKey, _param);
    }
    
    // Get Token Data
    function GetAddress(uint256 key, string param) public view returns(address)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._GetAddress(stakeholder, key, _param);
    }
    function GetBool(uint256 key, string param) public view returns(bool)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._GetBool(stakeholder, key, _param);
    }
    function GetString(uint256 key, string param) public view returns(bytes32)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._GetString(stakeholder, key, _param);
    }
    function GetUint(uint256 key, string param) public view returns(uint256)
    {
        require(isValidContract(msg.sender) == true);
        bytes32 _param = stringToBytes32(param);
        return proxy._GetUint(stakeholder, key, _param);
    }
    
    // Get Contract Data Counts
    function contractAddressCount() public view returns(uint)
    {
        require(isValidContract(msg.sender) == true);
        return proxy._contractAddressCount(stakeholder);
    }
    function contractBoolCount() public view returns(uint)
    {
        require(isValidContract(msg.sender) == true);
        return proxy._contractBoolCount(stakeholder);
    }
    function contractStringCount() public view returns(uint)
    {
        require(isValidContract(msg.sender) == true);
        return proxy._contractStringCount(stakeholder);
    }
    function contractUintCount() public view returns(uint)
    {
        require(isValidContract(msg.sender) == true);
        return proxy._contractUintCount(stakeholder);
    }
}
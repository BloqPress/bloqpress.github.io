pragma solidity ^0.4.18;

// Castor = 0x32fA37dE6481a9dAa3FADaec8f4702774A2D4fA1

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
    address public admin;
    event OwnershipTransferred(address indexed previousAdmin, address indexed newAdmin);
    
    function Upgradable() public 
    {
        admin = msg.sender;
    }

    modifier onlyAdmin() 
    {
        require(msg.sender == admin);
        _;
    }

    function transferOwnership(address newAdmin) onlyAdmin public 
    {
        require(newAdmin != address(0));
        emit OwnershipTransferred(admin, newAdmin);
        admin = newAdmin;
    }
}

contract Proxy is Upgradable
{
    function getString(string key) public view returns(bytes32);
    function setString(string key, bytes32 value) public;
    function setUint(string key, uint256 value) public;
    function setsUint(address addressKey, string param, uint256 value) public;
    function SetAddress(uint256 key, string param, address value) public;
    function SetString(uint256 key, string param, bytes32 value) public;
    function SetUint(uint256 key, string param, uint256 value) public;
    function getUint(string key) public view returns(uint256);
    function getsUint(address addressKey, string param) public view returns(uint256);
    function GetAddress(uint256 key, string param) public view returns(address);
    function GetString(uint256 key, string param) public view returns(bytes32);
    function GetUint(uint256 key, string param) public view returns(uint256);
}

contract ERC721Factory is Upgradable
{
    Proxy db;
    
    using SafeMath for uint;
    
    address public assetProxyAddress;
    
    mapping(address => bool) canWriteToERC721;
    
    function ERC721Factory
    (
        address proxyAddress
    ) 
    public onlyAdmin
    {
        updateProxy(proxyAddress);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        assetProxyAddress = proxyAddress;
    }
    
    function updateSettings
    (
        string tokenName, 
        string optionalKey
    ) 
    public onlyAdmin
    {
        if(db.getString('721') == stringToBytes32(''))
        {
            db.setString(
                '721', 
                stringToBytes32(optionalKey)
            );
        }
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        db.setString(assetID('n', optionalKey), stringToBytes32(tokenName));
        db.setString(assetID('s', optionalKey), stringToBytes32(optionalKey));
    }
    
    function editWriteAddress(address Address, bool canWrite) public onlyAdmin
    {
        require(canWriteToERC721[Address] != canWrite);
        canWriteToERC721[Address] = canWrite;
    }
    
    function assetID(string key, string symbol) internal view returns(string)
    {
        if(stringToBytes32(symbol) == stringToBytes32(''))
        {
            symbol = bytes32ToString(db.getString('721'));
        }
        return combine('721', '_', symbol, '_', key);
    }
    
    /*
    
    ERC 721 FUNCTIONS
    
    */
    
    function name(string optionalKey) public constant returns(string)
    {
        return bytes32ToString(named(optionalKey));
    }
    
    function symbol(string optionalKey) public constant returns(string)
    {
        return bytes32ToString(symbolic(optionalKey));
    }
    
    function named(string optionalKey) public constant returns(bytes32)
    {
        return db.getString(assetID('n', optionalKey));
    }
    
    function symbolic(string optionalKey) public constant returns(bytes32)
    {
        return db.getString(assetID('s', optionalKey));
    }
    
    function totalSupply(string optionalKey) public view returns (uint) 
    {
        return db.getUint(assetID('t', optionalKey));
    }
    
    function balanceOf(address owner, string optionalKey) public view returns (uint) 
    {
        return db.getsUint(owner, assetID('b', optionalKey));
    }
    
    function tokenOfOwnerByIndex(address owner, uint index, string optionalKey) public view returns (uint) 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        require(index >= 0);
        require(index < balanceOf(owner, optionalKey));
        return db.getsUint(
            owner, 
            combine('o', '_', uintToString(index), '_', optionalKey)
        );
    }
    
    function getAllTokens(address owner, string optionalKey) public view returns (uint[]) 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        uint[] memory result = new uint[](db.getsUint(owner, assetID('b', optionalKey)));
        for (uint index = 0; index < result.length; index++) 
        {
            result[index] = tokenOfOwnerByIndex(owner, index, optionalKey);
        }
        return result;
    }
    
    function ownerOf(uint id, string optionalKey) public view returns (address) 
    {
        return db.GetAddress(id, assetID('o', optionalKey));
    }
    
    function metadata(uint256 id, string optionalKey) public view returns(string) 
    {
        return bytes32ToString(metabytes(id, optionalKey));
    }
    
    function metabytes(uint256 id, string optionalKey) public view returns(bytes32) 
    {
        return db.GetString(id, assetID('m', optionalKey));
    }
    
    function updateTokenMetadata(uint id, string meta, string optionalKey) public returns(bool)
    {
        require(db.GetAddress(id, assetID('o', optionalKey)) == tx.origin);
        db.SetString(id, assetID('m', optionalKey), stringToBytes32(meta));
        return true;
    }
    
    function transfer(address to, uint id, string optionalKey) public returns(bool)
    {
        _transfer(tx.origin, to, id, optionalKey);
        return true;
    }
    
    function send(address from, address to, uint id, string optionalKey) public
    {
        require(
            canWriteToERC721[msg.sender] == true
            || canWriteToERC721[tx.origin] == true
        );
        _transfer(from, to, id, optionalKey);
    }

    function _transfer(address from, address to, uint id, string optionalKey) internal
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        require(db.GetAddress(id, assetID('o', optionalKey)) == from);
        _removeTokenFrom(from, id, optionalKey);
        _addTokenTo(to, id, optionalKey);
    }

    function mint(address Address, uint256 id, string meta, string optionalKey) public
    {
        require(
            canWriteToERC721[msg.sender] == true
            || canWriteToERC721[tx.origin] == true
        );
        require(db.GetString(id, assetID('m', optionalKey)) == stringToBytes32(''));
        db.SetString(id, assetID('m', optionalKey), stringToBytes32(meta));
        db.setUint(assetID('t', optionalKey), db.getUint(assetID('t', optionalKey)).add(1));
        _addTokenTo(Address, id, optionalKey);
    }
    
    function destroy(address Address, uint id, string optionalKey) public
    {
        require(
            canWriteToERC721[msg.sender] == true
            || canWriteToERC721[tx.origin] == true
        );
        require(db.GetString(id, assetID('m', optionalKey)) != stringToBytes32(''));
        db.SetString(id, assetID('m', optionalKey), '');
        db.setUint(assetID('t', optionalKey), db.getUint(assetID('t', optionalKey)).sub(1));
        _removeTokenFrom(Address, id, optionalKey);
    }
    
    /*
    
    INTERNALS
    
    */

    function _removeTokenFrom(address from, uint id, string optionalKey) internal 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        require(db.getsUint(from, assetID('b', optionalKey)) > 0);
        uint length = db.getsUint(from, assetID('b', optionalKey));
        uint index = db.GetUint(id, assetID('i', optionalKey));
        uint swapToken = db.getsUint(from, combine('o', '_', uintToString(length.sub(1)), '_', optionalKey));
        db.setsUint(from, combine('o', '_', uintToString(index), '_', optionalKey), swapToken);
        db.SetUint(swapToken, assetID('i', optionalKey), index);
        db.setsUint(from, assetID('b', optionalKey), length.sub(1));
        db.SetAddress(id, assetID('o', optionalKey), address(0));
    }

    function _addTokenTo(address Address, uint id, string optionalKey) internal 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('721'));
        }
        uint length = db.getsUint(Address, assetID('b', optionalKey));
        db.setsUint(Address, combine('o', '_', uintToString(length), '_', optionalKey), id);
        db.SetAddress(id, assetID('o', optionalKey), Address);
        db.SetUint(id, assetID('i', optionalKey), length);
        db.setsUint(Address, assetID('b', optionalKey), length.add(1));
    }
}
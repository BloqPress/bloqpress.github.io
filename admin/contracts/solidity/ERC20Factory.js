pragma solidity ^0.4.18;

// Castor = 0xcF7618C05767c52403588e41252aB746c23b0813

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
    // Set Contract Data
    function setAddress(string key, address value) public;
    function setBool(string key, bool value) public;
    function setString(string key, bytes32 value) public;
    function setUint(string key, uint256 value) public;
    // Set Addressed Data
    function setsAddress(address addressKey, string param, address value) public;
    function setsBool(address addressKey, string param, bool value) public;
    function setsString(address addressKey, string param, bytes32 value) public;
    function setsUint(address addressKey, string param, uint256 value) public;
    // Set Token Data
    function SetAddress(uint256 key, string param, address value) public;
    function SetBool(uint256 key, string param, bool value) public;
    function SetString(uint256 key, string param, bytes32 value) public;
    function SetUint(uint256 key, string param, uint256 value) public;
    // Get Contract Data
    function getAddress(string key) public view returns(address);
    function getBool(string key) public view returns(bool);
    function getString(string key) public view returns(bytes32);
    function getUint(string key) public view returns(uint256);
    // Get Addressed Data
    function getsAddress(address addressKey, string param) public view returns(address);
    function getsBool(address addressKey, string param) public view returns(bool);
    function getsString(address addressKey, string param) public view returns(bytes32);
    function getsUint(address addressKey, string param) public view returns(uint256);
    // Get Token Data
    function GetAddress(uint256 key, string param) public view returns(address);
    function GetBool(uint256 key, string param) public view returns(bool);
    function GetString(uint256 key, string param) public view returns(bytes32);
    function GetUint(uint256 key, string param) public view returns(uint256);
    // Get Contract Data Counts
    function contractAddressCount() public view returns(uint);
    function contractBoolCount() public view returns(uint);
    function contractStringCount() public view returns(uint);
    function contractUintCount() public view returns(uint);
    // Get Addressed Data Counts
    function addressAddressCount(address addressKey) public view returns(uint);
    function addressBoolCount(address addressKey) public view returns(uint);
    function addressStringCount(address addressKey) public view returns(uint);
    function addressUintCount(address addressKey) public view returns(uint);
    // Get Token Data Counts
    function tokenAddressCount(uint256 key) public view returns(uint);
    function tokenBoolCount(uint256 key) public view returns(uint);
    function tokenStringCount(uint256 key) public view returns(uint);
    function tokenUintCount(uint256 key) public view returns(uint);
}

contract ERC20Factory is Upgradable
{
    Proxy db;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    
    mapping(address => bool) canWriteToERC20;
    
    function () public payable 
    {
        revert();
    }
    
    function ERC20Factory
    (
        address proxyAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
    }
    
    function setupERC20Factory
    (
        string defaultTokenName,
        string defaultTokenSymbol,
        uint defaultTokenDecimals
    )
    public onlyAdmin
    {
        db.setString('default_symbol', stringToBytes32(defaultTokenSymbol));
        updateSettings(defaultTokenName, defaultTokenDecimals, defaultTokenSymbol);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        proxyContractAddress = proxyAddress;
    }
    
    function updateDefault(string tokenSymbol) public onlyAdmin
    {
        db.setString('default_symbol', stringToBytes32(tokenSymbol));
    }
    
    function updateSettings
    (
        string tokenName, 
        uint tokenDecimals,
        string optionalKey
    ) 
    public onlyAdmin
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('default_symbol'));
        }
        db.setUint(tokenID('decimals', optionalKey), tokenDecimals);
        db.setString(tokenID('name', optionalKey), stringToBytes32(tokenName));
        db.setString(tokenID('symbol', optionalKey), stringToBytes32(optionalKey));
    }
    
    function tokenID(string key, string symbol) internal view returns(string)
    {
        if(stringToBytes32(symbol) == stringToBytes32(''))
        {
            symbol = bytes32ToString(db.getString('default_symbol'));
        }
        return combine('ERC20', '_', symbol, '_', key);
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToERC20[Address] == false);
        canWriteToERC20[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToERC20[Address] == true);
        canWriteToERC20[Address] = false;
    }
    
    /*
    
    ERC20 FUNCTIONS
    
    */
    
    function name(string optionalKey) public constant returns(string)
    {
        return bytes32ToString(named(optionalKey));
    }
    
    function named(string optionalKey) public constant returns(bytes32)
    {
        return db.getString(tokenID('name', optionalKey));
    }
    
    function decimals(string optionalKey) public constant returns(uint)
    {
        return db.getUint(tokenID('decimals', optionalKey));
    }
    
    function symbolic(string optionalKey) public constant returns(bytes32)
    {
        return db.getString(tokenID('symbol', optionalKey));
    }
    
    function symbol(string optionalKey) public constant returns(string)
    {
        return bytes32ToString(symbolic(optionalKey));
    }
    
    function totalSupply(string optionalKey) public constant returns (uint) 
    {
        return db.getUint(tokenID('total', optionalKey));
    }

    function balanceOf(address owner, string optionalKey) public constant returns (uint balance) 
    {
        return db.getsUint(owner, tokenID('balance', optionalKey));
    }
    
    function transfer(address to, uint amount, string optionalKey) public returns (bool) 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('default_symbol'));
        }
        _transfer(tx.origin, to, amount, optionalKey);
        return true;
    }
    
    function send(address from, address to, uint amount, string optionalKey) public 
    {
        require
        (
            canWriteToERC20[msg.sender] == true
            || canWriteToERC20[tx.origin] == true
        );
        _transfer(from, to, amount, optionalKey);
    }
    
    function _transfer(address from, address to, uint amount, string optionalKey) internal 
    {
        if(stringToBytes32(optionalKey) == stringToBytes32(''))
        {
            optionalKey = bytes32ToString(db.getString('default_symbol'));
        }
        require(db.getsUint(from, tokenID('balance', optionalKey)) >= amount);
        db.setsUint(
            from, 
            tokenID('balance', optionalKey), 
            db.getsUint(from, tokenID('balance', optionalKey)).sub(amount)
        );
        db.setsUint(
            to, 
            tokenID('balance', optionalKey), 
            db.getsUint(to, tokenID('balance', optionalKey)).add(amount)
        );
    }
    
    function mint(address owner, uint amount, string optionalKey) public onlyAdmin
    {
        _mint(owner, amount, optionalKey);
    }
    
    function destroy(address owner, uint amount, string optionalKey) public onlyAdmin
    {
        _destroy(owner, amount, optionalKey);
    }
    
    function mintTokens(address owner, uint amount, string optionalKey) public
    {
        require
        (
            canWriteToERC20[msg.sender] == true
            || canWriteToERC20[tx.origin] == true
        );
        _mint(owner, amount, optionalKey);
    }
    
    function destroyTokens(address owner, uint amount, string optionalKey) public
    {
        require
        (
            canWriteToERC20[msg.sender] == true
            || canWriteToERC20[tx.origin] == true
        );
        _destroy(owner, amount, optionalKey);
    }
    
    function _mint(address owner, uint amount, string optionalKey) internal
    {
        db.setUint(tokenID('total', optionalKey), db.getUint(tokenID('total', optionalKey)).add(amount));
        db.setsUint(owner, tokenID('balance', optionalKey), db.getsUint(owner, tokenID('balance', optionalKey)).add(amount));
    }
    
    function _destroy(address owner, uint amount, string optionalKey) internal
    {
        db.setUint(tokenID('total', optionalKey), db.getUint(tokenID('total', optionalKey)).sub(amount));
        db.setsUint(owner, tokenID('balance', optionalKey), db.getsUint(owner, tokenID('balance', optionalKey)).sub(amount));
    }
    
    /*

    DECENTRALIZED EXCHANGE
    
    */
    
    function setRate
    (
        string fromSymbol, 
        uint fromAmount, 
        string toSymbol, 
        uint toAmount
    ) 
    public onlyAdmin
    {
        string memory pair = combine(fromSymbol, '_', toSymbol, '', '');
        db.setUint(tokenID('from', pair), fromAmount);
        db.setUint(tokenID('to', pair), toAmount);
    }
    
    function getRates
    (
        string fromSymbol, 
        string toSymbol
    ) 
    public view returns(uint fromAmount, uint toAmount)
    {
        string memory pair = combine(fromSymbol, '_', toSymbol, '', '');
        uint from = db.getUint(tokenID('from', pair));
        uint to = db.getUint(tokenID('to', pair));
        return(from, to);
    }
    
    function getRate
    (
        string fromSymbol, 
        string toSymbol,
        uint amount
    ) 
    public view returns(uint)
    {
        string memory pair = combine(fromSymbol, '_', toSymbol, '', '');
        uint from = db.getUint(tokenID('from', pair));
        uint to = db.getUint(tokenID('to', pair));
        uint fromUnits = amount.div(from);
        return fromUnits.mul(to);
    }
    
    function convert
    (
        string fromSymbol, 
        string toSymbol,
        uint amount
    ) 
    public
    {
        uint toAmount = getRate(fromSymbol, toSymbol, amount);
        require(toAmount > 0);
        require(balanceOf(tx.origin, fromSymbol) >= amount);
        _destroy(tx.origin, amount, fromSymbol);
        _mint(tx.origin, toAmount, toSymbol);
    }
}
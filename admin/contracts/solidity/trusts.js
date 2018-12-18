pragma solidity ^0.4.18;

// Castor = 0x5E0a018a4E4917041a4C7Bc6E5a178A4960931f2

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
    function named(string optionalKey) public constant returns(bytes32);
    function decimals(string optionalKey) public constant returns(uint);
    function symbolic(string optionalKey) public constant returns(bytes32);
    function totalSupply(string optionalKey) public constant returns (uint);
    function balanceOf(address owner, string optionalKey) public constant returns (uint balance);
    function transfer(address to, uint amount, string optionalKey) public returns (bool);
    function send(address from, address to, uint amount, string optionalKey) public;
}

contract ERC721Factory is Upgradable
{
    function named(string optionalKey) public constant returns(bytes32);
    function symbolic(string optionalKey) public constant returns(bytes32);
    function totalSupply(string optionalKey) public view returns (uint);
    function balanceOf(address owner, string optionalKey) public view returns (uint);
    function ownerOf(uint id, string optionalKey) public view returns (address);
    function metabytes(uint256 id, string optionalKey) public view returns(bytes32);
    function transfer(address to, uint id, string optionalKey) public returns(bool);
    function send(address from, address to, uint id, string optionalKey) public;
    function tokenOfOwnerByIndex(address owner, uint index, string optionalKey) public view returns (uint);
    function mint(address Address, uint256 id, string meta, string optionalKey) public;
    function destroy(address Address, uint id, string optionalKey) public;
}

contract Trusts is Upgradable
{
    Proxy db;
    
    ERC721Factory assets;
    ERC20Factory tokens;
    
    using SafeMath for uint;
    
    address public tokenContractAddress;
    address public assetContractAddress;
    address public proxyContractAddress;
    
    mapping(address => bool) canWriteToTrustee;
    
    function () public payable 
    {
        revert();
    }
    
    function Trusts
    (
        address proxyAddress,
        address tokenAddress,
        address assetAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateTokens(tokenAddress);
        updateAssets(assetAddress);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        proxyContractAddress = proxyAddress;
    }
    
    function updateAssets(address assetAddress) public onlyAdmin
    {
        assets = ERC721Factory(assetAddress);
        assetContractAddress = assetAddress;
    }
    
    function updateTokens(address tokenAddress) public onlyAdmin
    {
        tokens = ERC20Factory(tokenAddress);
        tokenContractAddress = tokenAddress;
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToTrustee[Address] == false);
        canWriteToTrustee[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToTrustee[Address] == true);
        canWriteToTrustee[Address] = false;
    }
    
    function UID(string key) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', key));
    }
    
    /*
    
    TRUSTEE FUNCTIONS
    
    */
    
    function activeTrusts() public view returns(uint)
    {
        return constructedTrusts().sub(deconstructedTrusts());
    }
    
    function constructedTrusts() public view returns(uint)
    {
        return db.GetUint(UID('constructed'), 'trusts');
    }
    
    function deconstructedTrusts() public view returns(uint)
    {
        return db.GetUint(UID('deconstructed'), 'trusts');
    }
    
    function registerSymbol(string theSymbol) public onlyAdmin returns(uint256)
    {
        require(db.GetString(UID(theSymbol), 'symbol') == stringToBytes32(''));
        db.SetString(UID(theSymbol), 'symbol', stringToBytes32(theSymbol));
        return UID(theSymbol);
    }
    
    function getSymbol(uint256 index) public view returns(string)
    {
        bytes32 sym = db.GetString(index, 'symbol');
        if(sym == stringToBytes32(''))
        {
            sym = stringToBytes32('XXX');
        }
        return bytes32ToString(sym);
    }
    
    function constructTrust
    (
        bytes32[] tokenSymbols,
        uint256[] tokenValues,
        bytes32[] assetSymbols,
        uint256[] assetValues
    )
    public returns(uint256)
    {
        require(tokenValues.length > 0 || assetValues.length > 0);
        require(tokenSymbols.length == tokenValues.length);
        require(assetSymbols.length == assetValues.length);
        
        uint256 trust = UID(combine('trust', 'number', uintToString(constructedTrusts()), '', ''));
        
        require(assets.ownerOf(trust, 'TRUSTS') == address(0));
        
        if(tokenValues.length > 0)
        {
            for (uint t = 0; t < tokenValues.length; t++)
            {
                tokens.send(tx.origin, proxyContractAddress, tokenValues[t], bytes32ToString(tokenSymbols[t]));
                db.SetString
                (
                    trust, 
                    combine('token', '_', uintToString(t), '_', 'symbol'),
                    tokenSymbols[t]
                );
                db.SetUint
                (
                    trust, 
                    combine('token', '_', uintToString(t), '_', 'value'),
                    tokenValues[t]
                );
            }
        }
        
        if(assetValues.length > 0)
        {
            for (uint a = 0; a < assetValues.length; a++)
            {
                assets.send(tx.origin, proxyContractAddress, assetValues[a], bytes32ToString(assetSymbols[a]));
                db.SetString
                (
                    trust, 
                    combine('asset', '_', uintToString(a), '_', 'symbol'),
                    assetSymbols[a]
                );
                db.SetUint
                (
                    trust, 
                    combine('asset', '_', uintToString(a), '_', 'value'),
                    assetValues[a]
                );
            }
        }
        
        db.SetUint(trust, 'tokens', tokenValues.length);
        db.SetUint(trust, 'assets', assetValues.length);
        
        string memory meta = combine
        (
            'Assets:', 
            uintToString(assetValues.length),
            ' | ',
            'Tokens:',
            uintToString(tokenValues.length)
        );
        
        assets.mint
        (
            tx.origin, 
            trust, 
            meta,
            'TRUSTS'
        );
        
        db.SetUint(UID('constructed'), 'trusts', db.GetUint(UID('constructed'), 'trusts').add(1));
        
        require(assets.ownerOf(trust, 'TRUSTS') == tx.origin);
        
        return trust;
    }
    
    function getBytes(string value) public pure returns(bytes32)
    {
        return(stringToBytes32(value));
    }
    
    function deconstructTrust(uint256 trust) public returns(bool success)
    {
        require(assets.ownerOf(trust, 'TRUSTS') == tx.origin);
        
        uint tc = db.GetUint(trust, 'tokens');
        uint ac = db.GetUint(trust, 'assets');
        
        if(tc > 0)
        {
            for (uint t = 0; t < tc; t++)
            {
                bytes32 ts = db.GetString(trust, combine('token', '_', uintToString(t), '_', 'symbol'));
                uint tv = db.GetUint(trust, combine('token', '_', uintToString(t), '_', 'value'));
                tokens.send(proxyContractAddress, tx.origin, tv, bytes32ToString(ts));
                db.SetString
                (
                    trust, 
                    combine('token', '_', uintToString(t), '_', 'symbol'),
                    stringToBytes32('')
                );
                db.SetUint
                (
                    trust, 
                    combine('token', '_', uintToString(t), '_', 'value'),
                    0
                );
            }
        }
        
        if(ac > 0)
        {
            for (uint a = 0; a < ac; a++)
            {
                bytes32 ass = db.GetString(trust, combine('asset', '_', uintToString(a), '_', 'symbol'));
                uint av = db.GetUint(trust, combine('asset', '_', uintToString(a), '_', 'value'));
                assets.send(proxyContractAddress, tx.origin, av, bytes32ToString(ass));
                db.SetString
                (
                    trust, 
                    combine('asset', '_', uintToString(a), '_', 'symbol'),
                    stringToBytes32('')
                );
                db.SetUint
                (
                    trust, 
                    combine('asset', '_', uintToString(a), '_', 'value'),
                    0
                );
            }
        }
        
        db.SetUint(UID('deconstructed'), 'trusts', db.GetUint(UID('deconstructed'), 'trusts').add(1));
        
        assets.destroy(tx.origin, trust, 'TRUSTS');
        
        return true;
    }
}
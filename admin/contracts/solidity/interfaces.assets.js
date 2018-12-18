pragma solidity ^0.4.18;

// Castor Equity = 0x99bFF8e325e94a54A1926B27267Da55b1bB26819
// Castor Trusts = 0xFdFBbA370f9dffaB7e66a885734De74d101d1ef3

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

contract ERC721Factory is Upgradable
{
    function named(string optionalKey) public constant returns(bytes32);
    function symbolic(string optionalKey) public constant returns(bytes32);
    function totalSupply(string optionalKey) public view returns (uint);
    function balanceOf(address owner, string optionalKey) public view returns (uint);
    function ownerOf(uint id, string optionalKey) public view returns (address);
    function metabytes(uint256 id, string optionalKey) public view returns(bytes32);
    function transfer(address to, uint id, string optionalKey) public returns(bool);
    function tokenOfOwnerByIndex(address owner, uint index, string optionalKey) public view returns (uint);
    function mint(address Address, uint256 id, string meta, string optionalKey) public;
}

contract AssetInterface is Upgradable
{
    Proxy db;
    ERC721Factory assets;
    using SafeMath for uint;
    
    bytes32 public assetBytes;
    
    function () public payable 
    {
        revert();
    }
    
    function AssetInterface
    (
        address proxyAddress,
        address assetAddress,
        string assetSymbol
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateAssets(assetAddress);
        updateAsset(assetSymbol);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
    }
    
    function updateAssets(address assetAddress) public onlyAdmin
    {
        assets = ERC721Factory(assetAddress);
    }
    
    function updateAsset(string assetSymbol) public onlyAdmin
    {
        assetBytes = stringToBytes32(assetSymbol);
    }
    
    /*
    
    ERC 721 FUNCTIONS
    
    */
    
    function name() public constant returns(string)
    {
        return bytes32ToString(assets.named(bytes32ToString(assetBytes)));
    }
    
    function symbol() public constant returns(string)
    {
        return bytes32ToString(assets.symbolic(bytes32ToString(assetBytes)));
    }
    
    function totalSupply() public view returns (uint) 
    {
        return assets.totalSupply(bytes32ToString(assetBytes));
    }
    
    function balanceOf(address Address) public view returns (uint) 
    {
        return assets.balanceOf(Address, bytes32ToString(assetBytes));
    }
    
    function ownerOf(uint id) public view returns (address) 
    {
        return assets.ownerOf(id, bytes32ToString(assetBytes));
    }
    
    function metadata(uint256 id) public view returns(string) 
    {
        return bytes32ToString(assets.metabytes(id, bytes32ToString(assetBytes)));
    }
    
    function transfer(address to, uint id) public returns(bool)
    {
        return assets.transfer(to, id, bytes32ToString(assetBytes));
    }
    
    function tokenOfOwnerByIndex(address Address, uint index) public view returns (uint) 
    {
        return assets.tokenOfOwnerByIndex(Address, index, bytes32ToString(assetBytes));
    }
    
    function getAllTokens(address Address) public view returns (uint[]) 
    {
        uint[] memory result = new uint[](balanceOf(Address));
        for (uint index = 0; index < result.length; index++) 
        {
            result[index] = tokenOfOwnerByIndex(Address, index);
        }
        return result;
    }
    
    /*
    
    SELF SERVING DEMO FUNCTIONS
    
    */
    
    function checkShares(address Address) public view returns (uint)
    {
        return db.getsUint(Address, 'equity');
    }
    
    function issueShare(string metaData) public 
    {
        require(checkShares(msg.sender).add(1) <= 100);
        uint256 assetID = uint256(keccak256(msg.sender, '|', checkShares(msg.sender).add(1)));
        db.setsUint(msg.sender, 'equity', checkShares(msg.sender).add(1));
        assets.mint(msg.sender, assetID, metaData, bytes32ToString(assetBytes));
    }
}
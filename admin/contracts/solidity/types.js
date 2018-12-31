pragma solidity ^0.4.18;

/*

PROPOSED SETUP

1) Launch Database
2) Launch Proxy then link Proxy to Database
3) Launch Types then link Types to Proxy
4) Launch Entities then link Entities to Proxy and Types
5) Launch Objects then link Objects to Proxy, Types, and Entities
6) Launch EditObjects then link EditObjects to Proxy, Types and Entities
7) Launch Blobs then link Blobs to Proxy and Entities

Examples of "types" include "posts" and "pages" ...
Examples of "entities" include "users" and "contracts" ...
Examples of "objects" include "user posts" and "contract pages" ...

*/

// BloqPress-v0.0.5 = 0xe4fa79bC58c5930F42103D2F73F51b3242e3E77D

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

contract Types is Upgradable
{
    Proxy db;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    
    mapping(address => bool) canWriteToTypes;
    
    function () public payable 
    {
        revert();
    }
    
    function Types
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
        proxyContractAddress = proxyAddress;
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToTypes[Address] == false);
        canWriteToTypes[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToTypes[Address] == true);
        canWriteToTypes[Address] = false;
    }
    
    
    function ID(string key, string value) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', key, '|', value));
    }
    
    /*
    
    ADMINISTRATIVE TYPE FUNCTIONS
    
    */
    
    function addType(string slug, string singleName, string pluralName) public onlyAdmin
    {
        require(db.GetBool(ID('TID', slug), 'type') == false);
        db.SetBool(ID('TID', slug), 'type', true);
        db.SetUint(ID('TID', slug), 'index', typeCount());
        db.SetString(ID('TID', uintToString(typeCount())), 'TID_INDEX', stringToBytes32(slug));
        db.SetString(ID('TID', slug), 'name', stringToBytes32(singleName));
        db.SetString(ID('TID', slug), 'names', stringToBytes32(pluralName));
        db.setUint('bp_types', typeCount().add(1));
    }
    
    /*

    IMPORTANT - THIS WILL RENDER ALL ATTACHED ENTITIES AND OBJECTS INACCESSIBKE
    
    */
    function removeType(string slug) public onlyAdmin
    {
        require(db.GetBool(ID('TID', slug), 'type') == true);
        db.SetBool(ID('TID', slug), 'type', false);
        
        uint indexToRemove = db.GetUint(ID('TID', slug), 'index');
        string memory lastSlug = getTypeSlug(typeCount().sub(1));
        
        db.SetString(ID('TID', uintToString(indexToRemove)), 'TID_INDEX', stringToBytes32(lastSlug));
        db.SetString(ID('TID', uintToString(typeCount().sub(1))), 'TID_INDEX', stringToBytes32(''));
        
        db.SetUint(ID('TID', slug), 'index', 0);
        db.SetUint(ID('TID', lastSlug), 'index', indexToRemove);
        
        db.SetString(ID('TID', slug), 'name', stringToBytes32(''));
        db.SetString(ID('TID', slug), 'names', stringToBytes32(''));
        db.setUint('bp_types', typeCount().sub(1));
    }
        
    function updateType(string slug, string singleName, string pluralName) public onlyAdmin
    {
        require(db.GetBool(ID('TID', slug), 'type') == true);
        
        require(
            (
                stringToBytes32(singleName) != stringToBytes32('')
                && db.GetString(ID('TID', slug), 'name') != stringToBytes32(singleName)
            )
            ||
            (
                stringToBytes32(pluralName) != stringToBytes32('')
                && db.GetString(ID('TID', slug), 'names') != stringToBytes32(pluralName)
            )
        );
        if(
            stringToBytes32(singleName) != stringToBytes32('')
            && db.GetString(ID('TID', slug), 'name') != stringToBytes32(singleName)
        ){
            db.SetString(ID('TID', slug), 'name', stringToBytes32(singleName));
        }
        if(
            stringToBytes32(pluralName) != stringToBytes32('')
            && db.GetString(ID('TID', slug), 'names') != stringToBytes32(pluralName)
        ){
            db.SetString(ID('TID', slug), 'names', stringToBytes32(pluralName));
        }
    }
    
    /*
    
    PUBLIC TYPE FUNCTIONS
    
    */
        
    function typeCount() public view returns(uint)
    {
        return db.getUint('bp_types');
    }
    
    function isType(string typeSlug) public view returns(bool)
    {
        return db.GetBool(ID('TID', typeSlug), 'type');
    }
    
    function getTypeSlugBytes(uint index) public view returns(bytes32)
    {
        return db.GetString(ID('TID', uintToString(index)), 'TID_INDEX');
    }
    
    function getTypeSlug(uint index) public view returns(string)
    {
        return bytes32ToString(getTypeSlugBytes(index));
    }
    
    function getType(string typeSlug) public view returns
    (
        uint TypeIndex,
        string SingleName,
        string PluralName
    )
    {
        return(
            typeIndex(typeSlug),
            typeName(typeSlug),
            typeNames(typeSlug)
        );
    }
    
    function getTypeByIndex(uint index) public view returns
    (
        string SingleName,
        string PluralName
    )
    {
        string memory typeSlug = getTypeSlug(index);
        return(
            typeName(typeSlug),
            typeNames(typeSlug)
        );
    }
    
    function getTypes() public view returns
    (
        bytes32[] slugs,
        bytes32[] singleNames,
        bytes32[] pluralNames
    )
    {
        bytes32[] memory Slugs = new bytes32[](typeCount());
        bytes32[] memory SingleNames = new bytes32[](typeCount());
        bytes32[] memory PluralNames = new bytes32[](typeCount());
        for(uint i = 0; i < typeCount(); i++)
        {
            Slugs[i] = getTypeSlugBytes(i);
            SingleNames[i] = typeNameBytes(getTypeSlug(i));
            PluralNames[i] = typeNamesBytes(getTypeSlug(i));
        }
        return
        (
            Slugs,
            SingleNames,
            PluralNames
        );
    }
    
    function typeIndex(string typeSlug) public view returns(uint)
    {
        return db.GetUint(ID('TID', typeSlug), 'index');
    }
    
    function typeNameBytes(string typeSlug) public view returns(bytes32)
    {
        return db.GetString(ID('TID', typeSlug), 'name');
    }
        
    function typeName(string typeSlug) public view returns(string)
    {
        return bytes32ToString(typeNameBytes(typeSlug));
    }
    
    function typeNamesBytes(string typeSlug) public view returns(bytes32)
    {
        return db.GetString(ID('TID', typeSlug), 'names');
    }
        
    function typeNames(string typeSlug) public view returns(string)
    {
        return bytes32ToString(typeNamesBytes(typeSlug));
    }
}
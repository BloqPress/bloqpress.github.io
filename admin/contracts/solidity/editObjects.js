pragma solidity ^0.4.18;

// BloqPress-v0.0.6 = 0x0757aeDb8495bc0e6F511c05a363685cbb0Ccb68

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
    
    function stringToBytes(string s) internal pure returns (bytes)
    {
        bytes memory b = bytes(s);
        return b;
    }
    
    function bytesToString(bytes b) internal pure returns (string)
    {
        string memory s = string(b);
        return s;
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
    function isType(string typeSlug) public view returns(bool);
}

contract Entities is Upgradable
{
    function entityRoleBytes(address Address, string typeSlug) public view returns(bytes32);
    function entityNameBytes(address Address, string typeSlug) public view returns(bytes32);
}

contract EditObjects is Upgradable
{
    Proxy db;
    Entities entities;
    Types types;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    address public entitiesContractAddress;
    address public typesContractAddress;
    
    mapping(address => bool) canWriteToObjects;
    
    function () public payable 
    {
        revert();
    }
    
    function EditObjects
    (
        address proxyAddress,
        address entitiesAddress,
        address typesAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateEntities(entitiesAddress);
        updateTypes(typesAddress);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        proxyContractAddress = proxyAddress;
    }
    
    function updateEntities(address entitiesAddress) public onlyAdmin
    {
        entities = Entities(entitiesAddress);
        entitiesContractAddress = entitiesAddress;
    }
    
    function updateTypes(address typesAddress) public onlyAdmin
    {
        types = Types(typesAddress);
        typesContractAddress = typesAddress;
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToObjects[Address] == false);
        canWriteToObjects[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToObjects[Address] == true);
        canWriteToObjects[Address] = false;
    }
    
    function ID(string value) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', value));
    }
    
    function OID(string typeSlug, string objectSlug) public view returns(uint256)
    {
        return ID(uintToString(uint256(keccak256(typeSlug, '|', 'OBJ', '|', objectSlug))));
    }
    
    /*
    
    OBJECT FUNCTIONALITY
    
    */
    
    function objectCount() public view returns(uint)
    {
        return db.getUint('objs');
    }
    
    function updateObjectTime(string typeSlug, string objectSlug, uint time) public
    {
        require(isApproved(msg.sender, typeSlug, objectSlug) == true);
        require(types.isType(typeSlug) == true);
        db.SetUint(OID(typeSlug, objectSlug), 'time', time);
    }
    
    function updateObjectOwner(string typeSlug, string objectSlug, address Address) public
    {
        require(isApproved(msg.sender, typeSlug, objectSlug) == true);
        require(types.isType(typeSlug) == true);
        db.SetAddress(OID(typeSlug, objectSlug), 'object', Address);
    }
    
    function updateObjectTitle(string typeSlug, string objectSlug, string title) public
    {
        require(isApproved(msg.sender, typeSlug, objectSlug) == true);
        require(types.isType(typeSlug) == true);
        db.SetString(OID(typeSlug, objectSlug), 'title', stringToBytes32(title));
    }
    
    function updateObjectUrl(string typeSlug, string objectSlug, string url) public
    {
        require(isApproved(msg.sender, typeSlug, objectSlug) == true);
        require(types.isType(typeSlug) == true);
        db.SetString(OID(typeSlug, objectSlug), 'url', stringToBytes32(url));
    }
    
    function updateObjectTags(string typeSlug, string objectSlug, string tags) public
    {
        require(isApproved(msg.sender, typeSlug, objectSlug) == true);
        require(types.isType(typeSlug) == true);
        db.SetString(OID(typeSlug, objectSlug), 'tags', stringToBytes32(tags));
    }
    
    function updateObjectType(string currentTypeSlug, string objectSlug, string newTypeSlug) public onlyAdmin
    {
        require(isApproved(msg.sender, currentTypeSlug, objectSlug) == true);
        require(types.isType(newTypeSlug) == true);
        require(db.GetBool(OID(newTypeSlug, objectSlug), 'object') == false);
        require(stringToBytes32(currentTypeSlug) != stringToBytes32(newTypeSlug));
        string memory currentTitle = bytes32ToString(getObjectTitleBytes(OID(currentTypeSlug, objectSlug)));
        string memory currentUrl = bytes32ToString(getObjectUrlBytes(OID(currentTypeSlug, objectSlug)));
        string memory currentTags = bytes32ToString(getObjectTagsBytes(OID(currentTypeSlug, objectSlug)));
        addObject(newTypeSlug, objectSlug, currentTitle, currentUrl, currentTags);
        removeObject(currentTypeSlug, objectSlug);
    }
    
    /*
    
    INTERNAL FUNCTIONS
    
    */
    
    function isApproved(address Address, string typeSlug, string slug) internal view returns(bool)
    {
        bytes32 role = entities.entityRoleBytes(Address, 'users');
        bool got = db.GetBool(OID(typeSlug, slug), 'object');
        if(role == stringToBytes32('admin') && got == true)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    
    function getObjectTitleBytes(uint id) internal view returns(bytes32)
    {
        return db.GetString(id, 'title');
    }
    
    function getObjectUrlBytes(uint id) internal view returns(bytes32)
    {
        return db.GetString(id, 'url');
    }
    
    function getObjectTagsBytes(uint id) internal view returns(bytes32)
    {
        return db.GetString(id, 'tags');
    }
    
    function getObjectType(uint index) internal view returns(string)
    {
        return bytes32ToString(db.GetString(index, 'OID_TYPE'));
    }
    
    function addObject(string typeSlug, string objectSlug, string title, string url, string tags) internal
    {
        require(types.isType(typeSlug) == true);
        require(entities.entityRoleBytes(msg.sender, 'users') == stringToBytes32('admin'));
        require(db.GetBool(OID(typeSlug, objectSlug), 'object') == false);
        db.SetBool(OID(typeSlug, objectSlug), 'object', true);
        db.SetString(OID(typeSlug, objectSlug), 'slug', stringToBytes32(objectSlug));
        db.SetString(OID(typeSlug, objectSlug), 'title', stringToBytes32(title));
        db.SetString(OID(typeSlug, objectSlug), 'url', stringToBytes32(url));
        db.SetString(OID(typeSlug, objectSlug), 'tags', stringToBytes32(tags));
        db.SetString(OID(typeSlug, objectSlug), 'type', stringToBytes32(typeSlug));
        db.SetUint(OID(typeSlug, objectSlug), 'time', block.timestamp);
        db.SetAddress(OID(typeSlug, objectSlug), 'object', msg.sender);
        db.SetUint(OID(typeSlug, objectSlug), 'index', db.getUint('objs'));
        
        db.SetUint(db.getUint('objs'), 'OID_INDEX', OID(typeSlug, objectSlug));
        db.SetString(db.getUint('objs'), 'OID_TYPE', stringToBytes32(typeSlug));
        
        db.setUint('objs', db.getUint('objs').add(1));
    }
        
    function removeObject(string typeSlug, string objectSlug) internal
    {
        require(entities.entityRoleBytes(msg.sender, 'users') == stringToBytes32('admin'));
        require(db.GetBool(OID(typeSlug, objectSlug), 'object') == true);
        
        uint index = db.GetUint(OID(typeSlug, objectSlug), 'index');
        uint lastObject = db.GetUint(db.getUint('objs').sub(1), 'OID_INDEX');
        string memory lastType = getObjectType(db.getUint('objs').sub(1));
        
        db.SetBool(OID(typeSlug, objectSlug), 'object', false);
        db.SetString(OID(typeSlug, objectSlug), 'slug', stringToBytes32(''));
        db.SetString(OID(typeSlug, objectSlug), 'title', stringToBytes32(''));
        db.SetString(OID(typeSlug, objectSlug), 'url', stringToBytes32(''));
        db.SetString(OID(typeSlug, objectSlug), 'tags', stringToBytes32(''));
        db.SetString(OID(typeSlug, objectSlug), 'type', stringToBytes32(''));
        db.SetUint(OID(typeSlug, objectSlug), 'index', 0);
        db.SetUint(OID(typeSlug, objectSlug), 'time', 0);
        db.SetAddress(OID(typeSlug, objectSlug), 'object', address(0));
        
        db.SetUint(index, 'OID_INDEX', lastObject);
        db.SetString(index, 'OID_TYPE', stringToBytes32(lastType));
        
        db.SetUint(lastObject, 'OID_INDEX', 0);
        db.SetString(lastObject, 'OID_TYPE', stringToBytes32(''));
        
        db.setUint('objs', db.getUint('objs').sub(1));
    }
}
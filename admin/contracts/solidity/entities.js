pragma solidity ^0.4.18;

// BloqPress-v0.0.6 = 0xEa5A4D1db6ecD818f8CDDE8B498DE9b440985fc3

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

// Mark Smalley = 0xB7a43A245e12b69Fd035EA95E710d17e71449f96

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
    function isType(string typeSlug) public view returns(bool);
}

contract Entities is Upgradable
{
    Proxy db;
    Types types;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    address public typesContractAddress;
    
    mapping(address => bool) canWriteToEntities;
    
    function () public payable 
    {
        revert();
    }
    
    function Entities
    (
        address proxyAddress,
        address typesAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateTypes(typesAddress);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        proxyContractAddress = proxyAddress;
    }
    
    function updateTypes(address typesAddress) public onlyAdmin
    {
        types = Types(typesAddress);
        typesContractAddress = typesAddress;
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToEntities[Address] == false);
        canWriteToEntities[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToEntities[Address] == true);
        canWriteToEntities[Address] = false;
    }
    
    function ID(string value) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', value));
    }
    
    function EID(address Address, string typeSlug) public view returns(uint256)
    {
        return ID(uintToString(uint256(keccak256(toString(Address), '|', 'EID', '|', typeSlug))));
    }
    
    /*
    
    ADMINISTRATIVE ENTITY FUNCTIONS
    
    */
    
    function addEntity(address Address, string typeSlug, string role, string name) public onlyAdmin
    {
        require(types.isType(typeSlug) == true);
        require(db.GetBool(EID(Address, typeSlug), 'entity') == false);
        db.SetBool(EID(Address, typeSlug), 'entity', true);
        
        db.SetUint(EID(Address, typeSlug), 'index', entityCount());
        db.SetAddress(EID(proxyContractAddress, uintToString(entityCount())), 'EID_INDEX', Address);
        db.SetString(EID(proxyContractAddress, uintToString(entityCount())), 'EID_TYPE', stringToBytes32(typeSlug));
        
        db.SetString(EID(Address, typeSlug), 'role', stringToBytes32(role));
        db.SetString(EID(Address, typeSlug), 'name', stringToBytes32(name));
        db.setUint('bp_entities', db.getUint('bp_entities').add(1));
    }
        
    function removeEntity(address Address, string typeSlug) public onlyAdmin
    {
        require(db.GetBool(EID(Address, typeSlug), 'entity') == true);
        db.SetBool(EID(Address, typeSlug), 'entity', false);
        
        uint indexToRemove = db.GetUint(EID(Address, typeSlug), 'index');
        address lastAddress = getEntityAddress(entityCount().sub(1));
        string memory lastType = getEntityType(entityCount().sub(1));
        
        db.SetAddress(EID(proxyContractAddress, uintToString(indexToRemove)), 'EID_INDEX', lastAddress);
        db.SetString(EID(proxyContractAddress, uintToString(indexToRemove)), 'EID_TYPE', stringToBytes32(lastType));
        db.SetAddress(EID(proxyContractAddress, uintToString(entityCount().sub(1))), 'EID_INDEX', address(0));
        db.SetString(EID(proxyContractAddress, uintToString(entityCount().sub(1))), 'EID_TYPE', stringToBytes32(''));
        
        db.SetUint(EID(Address, typeSlug), 'index', 0);
        db.SetUint(EID(lastAddress, lastType), 'index', indexToRemove);
        
        db.SetString(EID(Address, typeSlug), 'type', stringToBytes32(''));
        db.SetString(EID(Address, typeSlug), 'role', stringToBytes32(''));
        db.SetString(EID(Address, typeSlug), 'name', stringToBytes32(''));
        
        db.setUint('bp_entities', db.getUint('bp_entities').sub(1));
    }
        
    function updateEntity(address Address, string typeSlug, string role, string name) public onlyAdmin
    {
        require(db.GetBool(EID(Address, typeSlug), 'entity') == true);
        
        require(
            (
                stringToBytes32(role) != stringToBytes32('')
                && db.GetString(EID(Address, typeSlug), 'role') != stringToBytes32(role)
            )
            ||
            (
                stringToBytes32(name) != stringToBytes32('')
                && db.GetString(EID(Address, typeSlug), 'name') != stringToBytes32(name)
            )
        );
        
        if(
            stringToBytes32(role) != stringToBytes32('')
            && db.GetString(EID(Address, typeSlug), 'role') != stringToBytes32(role)
        ){
            db.SetString(EID(Address, typeSlug), 'role', stringToBytes32(role));
        }
        
        if(
            stringToBytes32(name) != stringToBytes32('')
            && db.GetString(EID(Address, typeSlug), 'name') != stringToBytes32(name)
        ){
            db.SetString(EID(Address, typeSlug), 'name', stringToBytes32(name));
        }
    }
    
    function updateEntityType(address Address, string currentSlug, string newSlug) public onlyAdmin
    {
        require(types.isType(newSlug) == true);
        require(db.GetBool(EID(Address, currentSlug), 'entity') == true);
        require(stringToBytes32(currentSlug) != stringToBytes32(newSlug));
        string memory currentRole = entityRole(Address, currentSlug);
        string memory currentName = entityName(Address, currentSlug);
        addEntity(Address, newSlug, currentRole, currentName);
        removeEntity(Address, currentSlug);
    }
     
        
    /*
    
    PUBLIC ENTITY FUNCTIONS
    
    */
    
    function entityCount() public view returns(uint)
    {
        return db.getUint('bp_entities');
    }
    
    function getEntityAddress(uint index) public view returns(address)
    {
        return db.GetAddress(EID(proxyContractAddress, uintToString(index)), 'EID_INDEX');
    }
    
    function getEntityType(uint index) public view returns(string)
    {
        return bytes32ToString(db.GetString(EID(proxyContractAddress, uintToString(index)), 'EID_TYPE'));
    }
    
    function getEntityIndex(address Address, string typeSlug) public view returns(uint)
    {
        return db.GetUint(EID(Address, typeSlug), 'index');
    }
    
    function getEntityBytes(address Address, string typeSlug) public view returns(
        bytes32 role,
        bytes32 name
    ){
        return(
            entityRoleBytes(Address, typeSlug),
            entityNameBytes(Address, typeSlug)
        );
    }
    
    function getEntity(address Address, string typeSlug) public view returns(
        string Role,
        string Name
    ){
        return(
            bytes32ToString(entityRoleBytes(Address, typeSlug)),
            bytes32ToString(entityNameBytes(Address, typeSlug))
        );
    }
    
    function getEntitiesByType(string typeSlug) public view returns
    (
        address[] Addresses,
        bytes32[] Roles,
        bytes32[] Names
    )
    {
        address[] memory addresses = new address[](entityCount());
        bytes32[] memory roles = new bytes32[](entityCount());
        bytes32[] memory names = new bytes32[](entityCount());
        for(uint i = 0; i < entityCount(); i++)
        {
            address thisAddress = getEntityAddress(i);
            addresses[i] = thisAddress;
            roles[i] = entityRoleBytes(thisAddress, typeSlug);
            names[i] = entityNameBytes(thisAddress, typeSlug);
        }
        return
        (
            addresses,
            roles,
            names
        );
    }
    
    function getEntities() public view returns
    (
        address[] Addresses,
        bytes32[] EntityTypes,
        bytes32[] Roles,
        bytes32[] Names
    )
    {
        address[] memory addresses = new address[](entityCount());
        bytes32[] memory roles = new bytes32[](entityCount());
        bytes32[] memory names = new bytes32[](entityCount());
        bytes32[] memory etypes = new bytes32[](entityCount());
        for(uint i = 0; i < entityCount(); i++)
        {
            string memory thisType = getEntityType(i);
            address thisAddress = getEntityAddress(i);
            addresses[i] = thisAddress;
            etypes[i] = stringToBytes32(thisType);
            roles[i] = entityRoleBytes(thisAddress, thisType);
            names[i] = entityNameBytes(thisAddress, thisType);
        }
        return
        (
            addresses,
            etypes,
            roles,
            names
        );
    }
    
    function isEntity(address Address, string typeSlug) public view returns(bool)
    {
        return db.GetBool(EID(Address, typeSlug), 'entity');
    }
        
    function entityRoleBytes(address Address, string typeSlug) public view returns(bytes32)
    {
        return db.GetString(EID(Address, typeSlug), 'role');
    }
        
    function entityRole(address Address, string typeSlug) public view returns(string)
    {
        return bytes32ToString(entityRoleBytes(Address, typeSlug));
    }
    
    function entityNameBytes(address Address, string typeSlug) public view returns(bytes32)
    {
        return db.GetString(EID(Address, typeSlug), 'name');
    }
        
    function entityName(address Address, string typeSlug) public view returns(string)
    {
        return bytes32ToString(entityNameBytes(Address, typeSlug));
    }
}
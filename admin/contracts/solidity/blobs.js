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

// BloqPress-v0.0.3 = 0x004f98aC9f71906C15a4B4e35957AD7D24D1DBCC

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

contract Entities is Upgradable
{
    function entityRoleBytes(address Address, string typeSlug) public view returns(bytes32);
}

contract Blobs is Upgradable
{
    Proxy db;
    Entities entities;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    address public entitiesContractAddress;
    
    mapping(address => bool) canWriteToBlobs;
    
    function () public payable 
    {
        revert();
    }
    
    function Blobs
    (
        address proxyAddress,
        address entitiesAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateEntities(entitiesAddress);
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
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToBlobs[Address] == false);
        canWriteToBlobs[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToBlobs[Address] == true);
        canWriteToBlobs[Address] = false;
    }
    
    function ID(string key, uint index) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', key, '|', index, 'BLOBS'));
    }
    
    /*
    
    WRAPPER FUNCTIONS
    
    */
    
    function commentCount() public view returns(uint)
    {
        return db.getUint('comments');
    }
    
    function commentsCount(uint256 articleID) public view returns(uint)
    {
        return db.GetUint(articleID, 'comments');
    }
    
    function addArticleDescription(uint article, bytes32[] textArray, uint arrayLength) public
    {
        storeLongString(ID('description', article), textArray, arrayLength);
    }
    
    function updateArticleDescription(uint article, bytes32[] textArray, uint arrayLength) public
    {
        updateLongString(ID('description', article), textArray, arrayLength);
    }
    
    function removeArticleDescription(uint article) public
    {
        removeLongString(ID('description', article));
    }
    
    function getArticleDescription(uint article) public view returns(bytes32[])
    {
        return getLongString(ID('description', article));
    }
    
    // Do comments require comment count trackers ???
    
    function addArticleComment(uint article, bytes32[] textArray, uint arrayLength) public
    {
        uint commentIndex = commentsCount(article);
        string memory id = combine('com', '_', uintToString(commentIndex), '', '');
        storeLongString(ID(id, article), textArray, arrayLength);
        db.setUint('comments', db.getUint('comments').add(1));
        db.SetUint(article, 'comments', db.GetUint(article, 'comments').add(1));
    }
    
    function updateArticleComment(uint article, uint commentIndex, bytes32[] textArray, uint arrayLength) public
    {
        string memory id = combine('com', '_', uintToString(commentIndex), '', '');
        updateLongString(ID(id, article), textArray, arrayLength);
    }
    
    function removeArticleComment(uint article, uint commentIndex) public
    {
        string memory id = combine('com', '_', uintToString(commentIndex), '', '');
        removeLongString(ID(id, article));
        db.setUint('comments', db.getUint('comments').sub(1));
        db.SetUint(article, 'comments', db.GetUint(article, 'comments').sub(1));
    }
    
    function getArticleComment(uint article, uint commentIndex) public view returns(bytes32[])
    {
        string memory id = combine('com', '_', uintToString(commentIndex), '', '');
        return getLongString(ID(id, article));
    }
    
    function getArticleComments(uint256 articleID) public view returns(uint256[])
    {
        uint currentCommentCount = commentsCount(articleID);
        uint256[] memory articleComments = new uint256[](currentCommentCount);
        for (uint i = 0; i < currentCommentCount; i++) 
        {
            uint256 commentID = uint256(keccak256(articleID, i, 'comment'));
            articleComments[i] = commentID;
        }
        return articleComments;
    }
    
    /*
    
    INTERNAL FUNCTIONS
    
    */
    
    function storeLongString(uint256 id, bytes32[] textArray, uint arrayLength) internal
    {
        require(entities.entityRoleBytes(msg.sender, 'users') == stringToBytes32('admin'));
        uint256 stringID = uint256(keccak256(id, '|', 'long_string'));
        require(db.GetUint(stringID, 'long_string') == 0);
        require(textArray.length == arrayLength);
        db.SetUint(stringID, 'long_string', arrayLength);
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(id, '|', 'string_part', '|', i));
            db.SetString(thisID, 'string_part', textArray[i]);
        }
    }
    
    function updateLongString(uint256 id, bytes32[] textArray, uint arrayLength) internal
    {
        require(entities.entityRoleBytes(msg.sender, 'users') == stringToBytes32('admin'));
        uint256 stringID = uint256(keccak256(id, '|', 'long_string'));
        require(db.GetUint(stringID, 'long_string') > 0);
        require(textArray.length == arrayLength);
        db.SetUint(stringID, 'long_string', arrayLength);
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(id, '|', 'string_part', '|', i));
            db.SetString(thisID, 'string_part', textArray[i]);
        }
    }
    
    function removeLongString(uint256 id) internal
    {
        require(entities.entityRoleBytes(msg.sender, 'users') == stringToBytes32('admin'));
        uint256 stringID = uint256(keccak256(id, '|', 'long_string'));
        require(db.GetUint(stringID, 'long_string') > 0);
        uint arrayLength = db.GetUint(stringID, 'long_string');
        db.SetUint(stringID, 'long_string', 0);
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(id, '|', 'string_part', '|', i));
            db.SetString(thisID, 'string_part', stringToBytes32(''));
        }
    }
    
    function getLongString(uint256 id) internal view returns(bytes32[])
    {
        uint256 stringID = uint256(keccak256(id, '|', 'long_string'));
        require(db.GetUint(stringID, 'long_string') > 0);
        uint arrayLength = db.GetUint(stringID, 'long_string');
        bytes32[] memory results = new bytes32[](arrayLength);
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(id, '|', 'string_part', '|', i));
            results[i] = db.GetString(thisID, 'string_part');
        }
        return results;
    }
}
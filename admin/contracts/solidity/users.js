pragma solidity ^0.4.18;

// NeuroNet = 0x085C438D6BDC3af81B7BdcFDC5C228dc0160E353
// BloqPress-v0.0.2 = 0xEF3302E7c71787f5847C99233B23F858696339C5

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

contract Users is Upgradable
{
    Proxy db;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    
    mapping(address => bool) canWriteToUsers;
    
    function () public payable 
    {
        revert();
    }
    
    function Users
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
        require(canWriteToUsers[Address] == false);
        canWriteToUsers[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToUsers[Address] == true);
        canWriteToUsers[Address] = false;
    }
    
    function UID(string key) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', key));
    }
    
    /*
    
    USER ADMIN FUNCTIONALITY
    
    */
    
    function userID(address Address, string key) public view returns(uint256)
    {
        return uint256(keccak256(toString(Address), '|', UID(key), '|', 'userID'));
    }
    
    function addUser(address Address, string role, string name) public onlyAdmin
    {
        require(db.GetBool(userID(Address, 'bp'), 'user') == false);
        db.SetBool(userID(Address, 'bp'), 'user', true);
        db.SetString(userID(Address, 'bp'), 'role', stringToBytes32(role));
        db.SetString(userID(Address, 'bp'), 'name', stringToBytes32(name));
    }
        
    function removeUser(address Address) public onlyAdmin
    {
        require(db.GetBool(userID(Address, 'bp'), 'user') == true);
        db.SetBool(userID(Address, 'bp'), 'user', false);
        db.SetString(userID(Address, 'bp'), 'role', stringToBytes32(''));
        db.SetString(userID(Address, 'bp'), 'name', stringToBytes32(''));
    }
        
    function updateUser(address Address, string role, string name) public onlyAdmin
    {
        require(db.GetBool(userID(Address, 'bp'), 'user') == true);
        
        require(
            (
                stringToBytes32(role) != stringToBytes32('')
                && db.GetString(userID(Address, 'bp'), 'role') != stringToBytes32(role)
            )
            ||
            (
                stringToBytes32(name) != stringToBytes32('')
                && db.GetString(userID(Address, 'bp'), 'name') != stringToBytes32(name)
            )
        );
        
        if(
            stringToBytes32(role) != stringToBytes32('')
            && db.GetString(userID(Address, 'bp'), 'role') != stringToBytes32(role)
        ){
            db.SetString(userID(Address, 'bp'), 'role', stringToBytes32(role));
        }
        
        if(
            stringToBytes32(name) != stringToBytes32('')
            && db.GetString(userID(Address, 'bp'), 'name') != stringToBytes32(name)
        ){
            db.SetString(userID(Address, 'bp'), 'name', stringToBytes32(name));
        }
    }
     
        
    /*
    
    USER PUBLIC FUNCTIONALITY
    
    */
    
    function getUserBytes(address Address) public view returns(
        bytes32 role,
        bytes32 name
    ){
        return(
            userRoleBytes(Address),
            userNameBytes(Address)
        );
    }
    
    function getUser(address Address) public view returns(
        string role,
        string name
    ){
        return(
            bytes32ToString(userRoleBytes(Address)),
            bytes32ToString(userNameBytes(Address))
        );
    }
        
    function isUser(address Address) public view returns(bool)
    {
        return db.GetBool(userID(Address, 'bp'), 'user');
    }
        
    function userRoleBytes(address Address) public view returns(bytes32)
    {
        return db.GetString(userID(Address, 'bp'), 'role');
    }
        
    function userRole(address Address) public view returns(string)
    {
        return bytes32ToString(userRoleBytes(Address));
    }
    
    function userNameBytes(address Address) public view returns(bytes32)
    {
        return db.GetString(userID(Address, 'bp'), 'name');
    }
        
    function userName(address Address) public view returns(string)
    {
        return bytes32ToString(userNameBytes(Address));
    }
}
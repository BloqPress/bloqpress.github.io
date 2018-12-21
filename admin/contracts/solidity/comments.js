pragma solidity ^0.4.18;

// BloqPress-v0.0.2 = 0xa507D8CBA782904C5E788A2Dd4446ff32C3Ad0A0

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

contract Users is Upgradable
{
    function userRoleBytes(address Address) public view returns(bytes32);
    function userNameBytes(address Address) public view returns(bytes32);
}

contract Articles is Upgradable
{
    function articleID(string slug) public view returns(uint256);
}

contract Comments is Upgradable
{
    Proxy db;
    Users users;
    Articles articles;
    
    using SafeMath for uint;
    
    address public proxyContractAddress;
    address public articleContractAddress;
    address public userContractAddress;
    
    mapping(address => bool) canWriteToArticles;
    
    function () public payable 
    {
        revert();
    }
    
    function Comments
    (
        address proxyAddress,
        address articleAddress,
        address userAddress
    )
    public onlyAdmin
    {
        updateProxy(proxyAddress);
        updateArticles(articleAddress);
        updateUsers(userAddress);
    }
    
    function updateProxy(address proxyAddress) public onlyAdmin
    {
        db = Proxy(proxyAddress);
        proxyContractAddress = proxyAddress;
    }
    
    function updateUsers(address userAddress) public onlyAdmin
    {
        users = Users(userAddress);
        userContractAddress = userAddress;
    }
    
    function updateArticles(address articleAddress) public onlyAdmin
    {
        articles = Articles(articleAddress);
        articleContractAddress = articleAddress;
    }
    
    function addWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToArticles[Address] == false);
        canWriteToArticles[Address] = true;
    }
    
    function removeWriteAddress(address Address) public onlyAdmin
    {
        require(canWriteToArticles[Address] == true);
        canWriteToArticles[Address] = false;
    }
    
    function UID(string key) public view returns(uint256)
    {
        return uint256(keccak256(toString(proxyContractAddress), '|', key));
    }
    
    /*
    
    COMMENT FUNCTIONALITY
    
    */
    
    function commentCount() public view returns(uint)
    {
        return db.getUint('comments');
    }
    
    function commentsCount(uint256 articleID) public view returns(uint)
    {
        return db.GetUint(articleID, 'comments');
    }
    
    function addComment(uint256 articleID, bytes32[] textArray, uint arrayLength) public
    {
        uint currentCommentCount = commentsCount(articleID);
        uint256 commentID = uint256(keccak256(articleID, currentCommentCount, 'comment'));
        
        require(users.userRoleBytes(msg.sender) == stringToBytes32('admin'));
        require(db.GetUint(commentID, 'comment_chunks') == 0);
        require(textArray.length == arrayLength);
        
        db.SetUint(commentID, 'comment_chunks', arrayLength);
        db.SetAddress(commentID, 'comment_owner', msg.sender);
        
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(commentID, '|', 'chunk', '|', i));
            db.SetString(thisID, 'comment_chunk', textArray[i]);
        }
        
        db.setUint('comments', db.getUint('comments').add(1));
        db.SetUint(articleID, 'comments', db.GetUint(articleID, 'comments').add(1));
    }
    
    function editCommentText(uint256 articleID, uint commentIndex, bytes32[] textArray, uint arrayLength) public
    {
        uint256 commentID = uint256(keccak256(articleID, commentIndex, 'comment'));
        
        require(users.userRoleBytes(msg.sender) == stringToBytes32('admin'));
        require(db.GetUint(commentID, 'comment_chunks') > 0);
        require(textArray.length == arrayLength);
        
        db.SetUint(commentID, 'comment_chunks', arrayLength);
        
        for (uint i = 0; i < arrayLength; i++) 
        {
            uint256 thisID = uint256(keccak256(commentID, '|', 'chunk', '|', i));
            db.SetString(thisID, 'comment_chunk', textArray[i]);
        }
    }
    
    function editCommentOwner(uint256 articleID, uint commentIndex, address Address) public
    {
        uint256 commentID = uint256(keccak256(articleID, commentIndex, 'comment'));
        
        require(users.userRoleBytes(msg.sender) == stringToBytes32('admin'));
        require(db.GetUint(commentID, 'comment_chunks') > 0);
        
        db.SetAddress(commentID, 'comment_owner', Address);
    }
    
    function getCommentOwner(uint256 articleID, uint commentIndex) public view returns(address)
    {
        uint256 commentID = uint256(keccak256(articleID, commentIndex, 'comment'));
        return db.GetAddress(commentID, 'comment_owner');
    }
    
    function getComments(uint256 articleID) public view returns(uint256[])
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
    
    function getCommentByIndex(uint256 articleID, uint256 commentIndex) public view returns(
        bytes32[] text,
        address owner,
        string author
    )
    {
        uint256 commentID = uint256(keccak256(articleID, commentIndex, 'comment'));
        uint chunkCount = db.GetUint(commentID, 'comment_chunks');
        bytes32[] memory chunks = new bytes32[](chunkCount);
        require(chunkCount > 0);
        for (uint i = 0; i < chunkCount; i++) 
        {
            uint256 thisID = uint256(keccak256(commentID, '|', 'chunk', '|', i));
            chunks[i] = db.GetString(thisID, 'comment_chunk');
        }
        return(
            chunks,
            db.GetAddress(commentID, 'comment_owner'),
            bytes32ToString(users.userNameBytes(db.GetAddress(commentID, 'comment_owner')))
        );
    }
}
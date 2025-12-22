// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditLog
 * @dev Stores immutable proofs of compliance actions on Arc Network.
 *      Only authorized "Compliance Oracle" (backend) can write logs.
 */
contract AuditLog {
    
    struct LogEntry {
        bytes32 entityId;      // Hash of the entity (Transaction ID, Alert ID, etc.)
        string actionType;     // "TRANSACTION_APPROVED", "ALERT_RESOLVED"
        bytes32 dataHash;      // Hash of the data content (integrity check)
        uint256 timestamp;
        address storedBy;
    }

    // Storage
    mapping(bytes32 => LogEntry) public logs; // Access by logId (hash of fields)
    address public owner;
    mapping(address => bool) public authorizedWriters;

    // Events (Cheaper than storage for external auditing)
    event ComplianceActionLogged(
        bytes32 indexed logId,
        bytes32 indexed entityId,
        string actionType,
        bytes32 dataHash,
        uint256 timestamp
    );

    event WriterUpdated(address indexed writer, bool isActive);

    constructor() {
        owner = msg.sender;
        authorizedWriters[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AuditLog: Caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedWriters[msg.sender], "AuditLog: Caller is not authorized");
        _;
    }

    /**
     * @dev Write a compliance action to the blockchain.
     * @param _entityId HashID of the referenced entity
     * @param _actionType String describing action
     * @param _dataHash Hash of the JSON payload
     */
    function logAction(bytes32 _entityId, string memory _actionType, bytes32 _dataHash) external onlyAuthorized returns (bytes32) {
        bytes32 logId = keccak256(abi.encodePacked(_entityId, _actionType, _dataHash, block.timestamp));
        
        logs[logId] = LogEntry({
            entityId: _entityId,
            actionType: _actionType,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            storedBy: msg.sender
        });

        emit ComplianceActionLogged(logId, _entityId, _actionType, _dataHash, block.timestamp);
        
        return logId;
    }

    function setAuthorizedWriter(address _writer, bool _isActive) external onlyOwner {
        authorizedWriters[_writer] = _isActive;
        emit WriterUpdated(_writer, _isActive);
    }
}

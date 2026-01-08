// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuditLog {
    function logAction(
        string memory entityId,
        string memory actionType,
        string memory ipfsHash
    ) external;
}

contract ComplianceGuardian {
    address public owner;
    IAuditLog public auditLog;
    
    mapping(address => bool) public whitelist;
    mapping(address => bool) public frozenWallets;
    
    event AgentWhitelisted(address indexed agent);
    event AgentFrozen(address indexed agent);
    event TransactionEvaluated(string indexed txId, bool approved, string reason);

    constructor(address _auditLogAddress) {
        owner = msg.sender;
        auditLog = IAuditLog(_auditLogAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function whitelistAgent(address _agent) external onlyOwner {
        whitelist[_agent] = true;
        emit AgentWhitelisted(_agent);
        auditLog.logAction("SYSTEM", "AGENT_WHITELISTED", "");
    }

    function freezeAgent(address _agent) external onlyOwner {
        frozenWallets[_agent] = true;
        emit AgentFrozen(_agent);
        auditLog.logAction("SYSTEM", "AGENT_FROZEN", "");
    }

    function evaluateTransaction(
        string memory txId,
        address agent,
        uint256 amount,
        bool isRiskHigh
    ) external returns (bool) {
        if (frozenWallets[agent]) {
            emit TransactionEvaluated(txId, false, "AGENT_FROZEN");
            return false;
        }

        if (!whitelist[agent]) {
            emit TransactionEvaluated(txId, false, "AGENT_NOT_WHITELISTED");
            return false;
        }

        if (isRiskHigh) {
            emit TransactionEvaluated(txId, false, "RISK_TOO_HIGH");
            return false;
        }

        emit TransactionEvaluated(txId, true, "APPROVED");
        return true;
    }
}

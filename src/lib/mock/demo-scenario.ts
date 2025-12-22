// 🎬 HACKATHON DEMO ARTIFACT
// This file orchestrates the "Live Simulation" for the judges.
// In a real deployment, these events would trigger from on-chain listeners.


export type SimulationStep = {
    id: number;
    delay: number; // ms delay before this event happens
    type: 'TRANSACTION' | 'ALERT' | 'STATUS_CHANGE';
    data: unknown;
};

export const demoScenario: SimulationStep[] = [
    {
        id: 1,
        delay: 2000,
        type: 'TRANSACTION',
        data: {
            agent: 'Agent_007',
            amount: 50,
            risk: 0.1,
            status: 'APPROVED',
            desc: 'Small test transaction'
        }
    },
    {
        id: 2,
        delay: 5000,
        type: 'TRANSACTION',
        data: {
            agent: 'Agent_007',
            amount: 1500,
            risk: 0.2,
            status: 'APPROVED',
            desc: 'Normal DEX Swap'
        }
    },
    {
        id: 3,
        delay: 10000,
        type: 'TRANSACTION',
        data: {
            agent: 'Agent_007',
            amount: 45000,
            risk: 0.85,
            status: 'BLOCKED',
            desc: 'Structuring Attempt (Layering)'
        }
    },
    {
        id: 4,
        delay: 11000,
        type: 'ALERT',
        data: {
            title: 'Structuring Pattern Detected',
            severity: 'HIGH',
            agent: 'Agent_007',
            aiAnalysis: 'Agent attempted to move significant funds rapidly after small test transactions. Matches "Wash Trading" profile.'
        }
    }
];

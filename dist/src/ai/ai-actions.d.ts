export type ProposalAction = 'add_expense' | 'add_income' | 'add_installment' | 'add_debt' | 'add_savings';
export declare const PROPOSAL_ACTIONS: ProposalAction[];
export interface ToolDef {
    name: ProposalAction;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, unknown>;
        required?: string[];
        additionalProperties: false;
    };
}
export declare const AI_TOOLS: ToolDef[];
export declare function summarizeProposal(action: ProposalAction, input: Record<string, unknown>): string;

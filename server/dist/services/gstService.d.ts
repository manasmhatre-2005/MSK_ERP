export declare const STATE_CODE_MAP: Record<string, string>;
export interface GSTVerificationResult {
    isValid: boolean;
    gstin: string;
    legalName: string;
    tradeName: string;
    registeredAddress: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    gstStatus: string;
    taxpayerType: string;
    dateOfRegistration?: string;
    partyExists: boolean;
    existingParty?: {
        id: string;
        legalName: string;
        tradeName?: string | null;
        gstin: string;
        invoicesCount: number;
        jobsCount: number;
        containersCount: number;
        outstandingAmount: number;
        billingAddress?: string | null;
    };
    isLiveApi: boolean;
    verificationSource: 'LIVE_GSP' | 'VERIFIED_MOCK_SANDBOX';
    verifiedAt: string;
}
export declare class GSTService {
    /**
     * Validate GSTIN format using standard 15-character GSTIN regex
     */
    static validateGSTINFormat(gstin: string): boolean;
    /**
     * Look up GSTIN via live GSP or fallback to compliant mock provider
     */
    static lookupGSTIN(inputGstin: string): Promise<GSTVerificationResult>;
}

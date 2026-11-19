export declare const config: {
    port: number;
    jwtSecret: string;
    environment: string;
    isProduction: boolean;
    allowedOrigins: string[];
    gst: {
        baseUrl: string;
        apiKey: string;
        apiSecret: string;
        isMock: boolean;
    };
    whatsapp: {
        accessToken: string;
        phoneNumberId: string;
        businessAccountId: string;
        verifyToken: string;
        isMock: boolean;
    };
};

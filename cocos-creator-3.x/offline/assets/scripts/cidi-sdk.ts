const DEFAULT_BASE_URL = 'https://elf-proxy.cidi.games/api/v1';
const DEFAULT_REWARDED_AD_TIMEOUT = 30000;

type CidiRewardedAdResult = {
    success?: boolean;
};

type CidiSdkInstance = {
    init?: () => Promise<unknown> | unknown;
    showRewardedAd?: (options: { timeout: number }) => Promise<CidiRewardedAdResult> | CidiRewardedAdResult;
};

type CidiProxyClient = {
    auth: {
        login: () => Promise<unknown>;
    };
    report: {
        medal: () => Promise<unknown>;
        medalOwnership: () => Promise<unknown>;
        tournamentScore: (input: { score: string; reportedAt: number }) => Promise<unknown>;
        gameTask: (input: { completeTime: number; metadata: string }) => Promise<unknown>;
        gameTaskResult: (input: { bizDate: string }) => Promise<unknown>;
    };
};

type CidiProxySdkInstance = {
    createClient?: (options: { baseURL: string; apiKey: string }) => CidiProxyClient;
};

type CidiError = Error & { code?: string };

declare global {
    interface Window {
        CiDiSDK?: CidiSdkInstance;
        CidiProxySDK?: CidiProxySdkInstance;
    }
}

export default class CidiSdk {
    private static baseURL = DEFAULT_BASE_URL;
    private static apiKey = '';
    private static rewardedAdTimeout = DEFAULT_REWARDED_AD_TIMEOUT;
    private static proxyClient: CidiProxyClient | null = null;
    private static cidiSdkReady = false;
    private static cidiSdkReadyPromise: Promise<boolean> | null = null;

    static configure(options?: { baseURL?: string; apiKey?: string; rewardedAdTimeout?: number }) {
        this.baseURL = options?.baseURL || DEFAULT_BASE_URL;
        this.apiKey = options?.apiKey || '';
        this.rewardedAdTimeout = options?.rewardedAdTimeout || DEFAULT_REWARDED_AD_TIMEOUT;
        this.proxyClient = null;

        return this;
    }

    static getCidiProxySdk(): CidiProxySdkInstance | null {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.CidiProxySDK || null;
    }

    static getCidiSdk(): CidiSdkInstance | null {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.CiDiSDK || null;
    }

    static initCidiSdk(): Promise<boolean> {
        if (this.cidiSdkReady) {
            return Promise.resolve(true);
        }

        const sdk = this.getCidiSdk();
        if (!sdk) {
            return Promise.reject(this.createError('CIDI_SDK_NOT_READY', 'CiDiSDK is not loaded.'));
        }

        if (typeof sdk.init !== 'function') {
            return Promise.resolve(true);
        }

        if (!this.cidiSdkReadyPromise) {
            try {
                this.cidiSdkReadyPromise = Promise.resolve(sdk.init())
                    .then(() => {
                        CidiSdk.cidiSdkReady = true;
                        return true;
                    })
                    .catch((error) => {
                        CidiSdk.cidiSdkReadyPromise = null;
                        return Promise.reject(error);
                    });
            } catch (error) {
                return Promise.reject(error);
            }
        }

        return this.cidiSdkReadyPromise;
    }

    static showRewardedAd(timeout?: number): Promise<boolean> {
        return this.initCidiSdk()
            .then(() => {
                const sdk = CidiSdk.getCidiSdk();
                if (!sdk || typeof sdk.showRewardedAd !== 'function') {
                    throw CidiSdk.createError('CIDI_AD_SDK_NOT_READY', 'CiDiSDK rewarded ad API is not loaded.');
                }

                return sdk.showRewardedAd({
                    timeout: timeout || CidiSdk.rewardedAdTimeout
                });
            })
            .then((result) => {
                if (result && result.success === true) {
                    console.log('[CIDI Demo] Rewarded ad success.');
                    return true;
                }

                throw CidiSdk.createError('CIDI_REWARDED_AD_FAILED', 'Rewarded ad did not return success.');
            })
            .catch(this.handleError);
    }

    static login(): Promise<boolean> {
        try {
            return this.getProxyClient().auth.login()
                .then(() => {
                    console.log('[CIDI Demo] Login success.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    static reportMedal(): Promise<boolean> {
        try {
            return this.getProxyClient().report.medal()
                .then(() => {
                    console.log('[CIDI Demo] Medal reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    static queryMedalOwnership(): Promise<unknown> {
        try {
            return this.getProxyClient().report.medalOwnership()
                .then((result) => {
                    console.log('[CIDI Demo] Medal ownership:', JSON.stringify(result));
                    return result;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    static reportTournamentScore(score: number | string): Promise<boolean> {
        try {
            return this.getProxyClient().report.tournamentScore({
                score: String(score),
                reportedAt: Math.floor(Date.now() / 1000)
            })
                .then(() => {
                    console.log('[CIDI Demo] Tournament score reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    static reportGameTask(metadata?: unknown): Promise<boolean> {
        try {
            return this.getProxyClient().report.gameTask({
                completeTime: Math.floor(Date.now() / 1000),
                metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {})
            })
                .then(() => {
                    console.log('[CIDI Demo] Game task reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    static queryGameTaskResult(bizDate: string): Promise<unknown> {
        try {
            return this.getProxyClient().report.gameTaskResult({
                bizDate
            })
                .then((result) => {
                    console.log('[CIDI Demo] Game task result:', JSON.stringify(result));
                    return result;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error as CidiError);
        }
    }

    private static getProxyClient(): CidiProxyClient {
        if (this.proxyClient) {
            return this.proxyClient;
        }

        const sdk = this.getCidiProxySdk();
        if (!sdk || typeof sdk.createClient !== 'function') {
            throw this.createError('CIDI_PROXY_SDK_NOT_READY', 'CidiProxySDK is not loaded. Check build templates and preview template scripts.');
        }

        if (!this.apiKey) {
            throw this.createError('CIDI_PROXY_API_KEY_MISSING', 'CIDI proxy apiKey is not configured.');
        }

        this.proxyClient = sdk.createClient({
            baseURL: this.baseURL,
            apiKey: this.apiKey
        });

        return this.proxyClient;
    }

    private static createError(code: string, message: string): CidiError {
        const error: CidiError = new Error(message);
        error.code = code;
        return error;
    }

    private static handleError(error: CidiError): Promise<never> {
        console.error('[CIDI Demo]', error && error.code, error && error.message);
        return Promise.reject(error);
    }
}

const DEFAULT_REWARDED_AD_TIMEOUT = 30000;

type CidiRewardedAdResult = {
    success?: boolean;
};

type CidiSdkInstance = {
    init?: () => Promise<unknown> | unknown;
    showRewardedAd?: (options: { timeout: number }) => Promise<CidiRewardedAdResult> | CidiRewardedAdResult;
};

declare global {
    interface Window {
        CiDiSDK?: CidiSdkInstance;
    }
}

export default class CidiSdk {
    private static rewardedAdTimeout = DEFAULT_REWARDED_AD_TIMEOUT;
    private static cidiSdkReady = false;
    private static cidiSdkReadyPromise: Promise<boolean> | null = null;

    static configure(options?: { rewardedAdTimeout?: number }) {
        this.rewardedAdTimeout = options?.rewardedAdTimeout || DEFAULT_REWARDED_AD_TIMEOUT;
        return this;
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
                    throw CidiSdk.createError('CIDI_SDK_NOT_READY', 'CiDiSDK rewarded ad API is not loaded.');
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

    private static createError(code: string, message: string): Error & { code?: string } {
        const error: Error & { code?: string } = new Error(message);
        error.code = code;
        return error;
    }

    private static handleError(error: Error & { code?: string }) {
        console.error('[CIDI Demo]', error && error.code, error && error.message);
        return Promise.reject(error);
    }
}

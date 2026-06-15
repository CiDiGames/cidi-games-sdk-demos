var DEFAULT_BASE_URL = 'https://elf-proxy.cidi.games/api/v1';
var DEFAULT_REWARDED_AD_TIMEOUT = 30000;

class CidiSdk {
    static configure(options) {
        options = options || {};

        this.baseURL = options.baseURL || DEFAULT_BASE_URL;
        this.apiKey = options.apiKey || '';
        this.rewardedAdTimeout = options.rewardedAdTimeout || DEFAULT_REWARDED_AD_TIMEOUT;
        this.proxyClient = null;

        return this;
    }

    static getCidiProxySdk() {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.CidiProxySDK || null;
    }

    static getCidiSdk() {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.CiDiSDK || null;
    }

    static initCidiSdk() {
        if (this.cidiSdkReady) {
            return Promise.resolve(true);
        }

        var sdk = this.getCidiSdk();
        if (!sdk || typeof sdk.init !== 'function') {
            return Promise.resolve(true);
        }

        if (!this.cidiSdkReadyPromise) {
            try {
                var initResult = sdk.init();
                this.cidiSdkReadyPromise = initResult && typeof initResult.then === 'function'
                    ? initResult
                    : Promise.resolve(initResult);
            } catch (error) {
                return Promise.reject(error);
            }

            this.cidiSdkReadyPromise = this.cidiSdkReadyPromise
                .then(function () {
                    CidiSdk.cidiSdkReady = true;
                    return true;
                })
                .catch(function (error) {
                    CidiSdk.cidiSdkReadyPromise = null;
                    return Promise.reject(error);
                });
        }

        return this.cidiSdkReadyPromise;
    }

    static showRewardedAd(timeout) {
        return this.initCidiSdk()
            .then(function () {
                var sdk = CidiSdk.getCidiSdk();
                if (!sdk || typeof sdk.showRewardedAd !== 'function') {
                    throw CidiSdk.createError('CIDI_AD_SDK_NOT_READY', 'CiDiSDK rewarded ad API is not loaded.');
                }

                return sdk.showRewardedAd({
                    timeout: timeout || CidiSdk.rewardedAdTimeout
                });
            })
            .then(function (result) {
                if (result && result.success === true) {
                    cc.log('[CIDI Demo] Rewarded ad success.');
                    return true;
                }

                throw CidiSdk.createError('CIDI_REWARDED_AD_FAILED', 'Rewarded ad did not return success.');
            })
            .catch(this.handleError);
    }

    static getProxyClient() {
        if (this.proxyClient) {
            return this.proxyClient;
        }

        var sdk = this.getCidiProxySdk();
        if (!sdk || typeof sdk.createClient !== 'function') {
            throw this.createError('CIDI_PROXY_SDK_NOT_READY', 'CidiProxySDK is not loaded. Check build-templates web scripts.');
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

    static login() {
        try {
            return this.getProxyClient().auth.login()
                .then(function () {
                    cc.log('[CIDI Demo] Login success.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static reportMedal() {
        try {
            return this.getProxyClient().report.medal()
                .then(function () {
                    cc.log('[CIDI Demo] Medal reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static queryMedalOwnership() {
        try {
            return this.getProxyClient().report.medalOwnership()
                .then(function (result) {
                    cc.log('[CIDI Demo] Medal ownership:', JSON.stringify(result));
                    return result;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static reportTournamentScore(score) {
        try {
            return this.getProxyClient().report.tournamentScore({
                score: String(score),
                reportedAt: Math.floor(Date.now() / 1000)
            })
                .then(function () {
                    cc.log('[CIDI Demo] Tournament score reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static reportGameTask(metadata) {
        try {
            return this.getProxyClient().report.gameTask({
                completeTime: Math.floor(Date.now() / 1000),
                metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {})
            })
                .then(function () {
                    cc.log('[CIDI Demo] Game task reported.');
                    return true;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static queryGameTaskResult(bizDate) {
        try {
            return this.getProxyClient().report.gameTaskResult({
                bizDate: bizDate
            })
                .then(function (result) {
                    cc.log('[CIDI Demo] Game task result:', JSON.stringify(result));
                    return result;
                })
                .catch(this.handleError);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static createError(code, message) {
        var error = new Error(message);
        error.code = code;
        return error;
    }

    static handleError(error) {
        cc.error('[CIDI Demo]', error && error.code, error && error.message);
        return Promise.reject(error);
    }
}

CidiSdk.baseURL = DEFAULT_BASE_URL;
CidiSdk.apiKey = '';
CidiSdk.rewardedAdTimeout = DEFAULT_REWARDED_AD_TIMEOUT;
CidiSdk.proxyClient = null;
CidiSdk.cidiSdkReady = false;
CidiSdk.cidiSdkReadyPromise = null;

module.exports = CidiSdk;

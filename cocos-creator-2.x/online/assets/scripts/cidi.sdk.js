var DEFAULT_REWARDED_AD_TIMEOUT = 30000;

class CidiSdk {
    static configure(options) {
        options = options || {};

        this.rewardedAdTimeout = options.rewardedAdTimeout || DEFAULT_REWARDED_AD_TIMEOUT;

        return this;
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
                    throw CidiSdk.createError('CIDI_SDK_NOT_READY', 'CiDiSDK rewarded ad API is not loaded.');
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

CidiSdk.rewardedAdTimeout = DEFAULT_REWARDED_AD_TIMEOUT;
CidiSdk.cidiSdkReady = false;
CidiSdk.cidiSdkReadyPromise = null;

module.exports = CidiSdk;

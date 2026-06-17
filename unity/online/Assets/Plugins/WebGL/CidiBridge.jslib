mergeInto(LibraryManager.library, {
  CidiBridge_Init: function (callbackObjectPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "init", function () {
      var sdk = cidiUnityGetCidiSdk();
      if (typeof sdk.init !== "function") {
        return true;
      }

      return Promise.resolve(sdk.init()).then(function () {
        return true;
      });
    });
  },

  CidiBridge_ShowRewardedAd: function (callbackObjectPtr, timeout) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "showRewardedAd", function () {
      var sdk = cidiUnityGetCidiSdk();
      if (typeof sdk.showRewardedAd !== "function") {
        throw cidiUnityCreateError("CIDI_REWARDED_AD_NOT_READY", "CiDiSDK rewarded ad API is not loaded.");
      }

      return Promise.resolve(sdk.showRewardedAd({
        timeout: timeout || 30000
      })).then(function (result) {
        if (result && result.success === true) {
          return result;
        }

        throw cidiUnityCreateError("CIDI_REWARDED_AD_FAILED", "Rewarded ad did not return success.");
      });
    });
  }
});

function cidiUnityGetCidiSdk() {
  if (!window.CiDiSDK) {
    throw cidiUnityCreateError("CIDI_SDK_NOT_READY", "CiDiSDK is not loaded.");
  }

  return window.CiDiSDK;
}

function cidiUnityRun(callbackObject, action, runner) {
  Promise.resolve()
    .then(runner)
    .then(function (result) {
      cidiUnitySend(callbackObject, "OnBridgeSuccess", action + ": " + cidiUnitySerialize(result));
    })
    .catch(function (error) {
      cidiUnitySend(callbackObject, "OnBridgeError", action + ": " + cidiUnityErrorMessage(error));
    });
}

function cidiUnitySend(callbackObject, method, payload) {
  if (window.unityInstance && typeof window.unityInstance.SendMessage === "function") {
    window.unityInstance.SendMessage(callbackObject, method, payload);
  } else if (typeof SendMessage === "function") {
    SendMessage(callbackObject, method, payload);
  } else {
    console.log("[CIDI Unity Demo]", method, payload);
  }
}

function cidiUnitySerialize(value) {
  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function cidiUnityCreateError(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function cidiUnityErrorMessage(error) {
  if (!error) {
    return "UNKNOWN_ERROR";
  }

  var code = error.code || "UNKNOWN_ERROR";
  var message = error.message || String(error);
  return code + " " + message;
}

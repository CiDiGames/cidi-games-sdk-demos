mergeInto(LibraryManager.library, {
  CidiBridge_Configure: function (baseUrlPtr, apiKeyPtr, rewardedAdTimeout) {
    window.__cidiUnityDemo = window.__cidiUnityDemo || {};
    window.__cidiUnityDemo.baseURL = UTF8ToString(baseUrlPtr);
    window.__cidiUnityDemo.apiKey = UTF8ToString(apiKeyPtr);
    window.__cidiUnityDemo.rewardedAdTimeout = rewardedAdTimeout || 30000;
    window.__cidiUnityDemo.proxyClient = null;
  },

  CidiBridge_Init: function (callbackObjectPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "init", function () {
      var sdk = cidiUnityGetCidiSdk();
      if (typeof sdk.init !== "function") {
        return Promise.resolve(true);
      }

      return Promise.resolve(sdk.init()).then(function () {
        return true;
      });
    });
  },

  CidiBridge_Login: function (callbackObjectPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "login", function () {
      return cidiUnityGetProxyClient().auth.login().then(function () {
        return true;
      });
    });
  },

  CidiBridge_ShowRewardedAd: function (callbackObjectPtr, timeout) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "showRewardedAd", function () {
      var sdk = cidiUnityGetCidiSdk();
      if (typeof sdk.showRewardedAd !== "function") {
        throw cidiUnityCreateError("CIDI_AD_SDK_NOT_READY", "CiDiSDK rewarded ad API is not loaded.");
      }

      return Promise.resolve(sdk.showRewardedAd({
        timeout: timeout || cidiUnityGetConfig().rewardedAdTimeout || 30000
      })).then(function (result) {
        if (result && result.success === true) {
          return true;
        }

        throw cidiUnityCreateError("CIDI_REWARDED_AD_FAILED", "Rewarded ad did not return success.");
      });
    });
  },

  CidiBridge_ReportMedal: function (callbackObjectPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "reportMedal", function () {
      return cidiUnityGetProxyClient().report.medal().then(function () {
        return true;
      });
    });
  },

  CidiBridge_QueryMedalOwnership: function (callbackObjectPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    cidiUnityRun(callbackObject, "queryMedalOwnership", function () {
      return cidiUnityGetProxyClient().report.medalOwnership();
    });
  },

  CidiBridge_ReportTournamentScore: function (callbackObjectPtr, scorePtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    var score = UTF8ToString(scorePtr);
    cidiUnityRun(callbackObject, "reportTournamentScore", function () {
      return cidiUnityGetProxyClient().report.tournamentScore({
        score: String(score),
        reportedAt: Math.floor(Date.now() / 1000)
      }).then(function () {
        return true;
      });
    });
  },

  CidiBridge_ReportGameTask: function (callbackObjectPtr, metadataPtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    var metadata = UTF8ToString(metadataPtr);
    cidiUnityRun(callbackObject, "reportGameTask", function () {
      return cidiUnityGetProxyClient().report.gameTask({
        completeTime: Math.floor(Date.now() / 1000),
        metadata: metadata || "{}"
      }).then(function () {
        return true;
      });
    });
  },

  CidiBridge_QueryGameTaskResult: function (callbackObjectPtr, bizDatePtr) {
    var callbackObject = UTF8ToString(callbackObjectPtr);
    var bizDate = UTF8ToString(bizDatePtr);
    cidiUnityRun(callbackObject, "queryGameTaskResult", function () {
      return cidiUnityGetProxyClient().report.gameTaskResult({
        bizDate: bizDate
      });
    });
  }
});

function cidiUnityGetConfig() {
  window.__cidiUnityDemo = window.__cidiUnityDemo || {};
  return window.__cidiUnityDemo;
}

function cidiUnityGetCidiSdk() {
  if (!window.CiDiSDK) {
    throw cidiUnityCreateError("CIDI_SDK_NOT_READY", "CiDiSDK is not loaded.");
  }

  return window.CiDiSDK;
}

function cidiUnityGetProxyClient() {
  var config = cidiUnityGetConfig();
  if (config.proxyClient) {
    return config.proxyClient;
  }

  if (!window.CidiProxySDK || typeof window.CidiProxySDK.createClient !== "function") {
    throw cidiUnityCreateError("CIDI_PROXY_SDK_NOT_READY", "CidiProxySDK is not loaded.");
  }

  if (!config.apiKey) {
    throw cidiUnityCreateError("CIDI_PROXY_API_KEY_MISSING", "CIDI proxy apiKey is not configured.");
  }

  config.proxyClient = window.CidiProxySDK.createClient({
    baseURL: config.baseURL || "https://elf-proxy.cidi.games/api/v1",
    apiKey: config.apiKey
  });

  return config.proxyClient;
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

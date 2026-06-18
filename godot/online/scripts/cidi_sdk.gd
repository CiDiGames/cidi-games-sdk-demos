class_name CidiSdk
extends Node

signal initialized
signal init_failed(message: String)
signal init_result(result: Dictionary)
signal rewarded_ad_completed
signal rewarded_ad_failed(message: String)
signal rewarded_ad_result(result: Dictionary)

const DEFAULT_REWARDED_AD_TIMEOUT := 30000

var rewarded_ad_timeout := DEFAULT_REWARDED_AD_TIMEOUT
var _initialized := false
var _rewarded_ad_pending := false
var _result_callback = null


func configure(options := {}) -> void:
	rewarded_ad_timeout = int(options.get("rewarded_ad_timeout", DEFAULT_REWARDED_AD_TIMEOUT))


func init_cidi_sdk() -> Dictionary:
	var result := _get_init_result()
	if bool(result.get("success", false)):
		_initialized = true
		initialized.emit()
		init_result.emit(result)
	else:
		init_failed.emit(result["message"])
		init_result.emit(result)
	return result


func show_rewarded_ad(timeout := 0) -> void:
	if _rewarded_ad_pending:
		var result := _failure_result("", "A rewarded ad request is already in progress.")
		rewarded_ad_failed.emit(result["message"])
		rewarded_ad_result.emit(result)
		return

	var ad_timeout := timeout if timeout > 0 else rewarded_ad_timeout
	if not _start_rewarded_ad({"timeout": ad_timeout}):
		var result := _failure_result("", "Rewarded ads are only available from a Web export.")
		rewarded_ad_failed.emit(result["message"])
		rewarded_ad_result.emit(result)
		return

	_rewarded_ad_pending = true


func show_rewarded_ad_async(timeout := 0) -> Dictionary:
	if _get_bridge() == null:
		return _failure_result("", "Rewarded ads are only available from a Web export.")

	show_rewarded_ad(timeout)
	return await rewarded_ad_result


func _start_rewarded_ad(args: Dictionary) -> bool:
	var bridge := _get_bridge()
	if bridge == null:
		return false
	if not _register_result_callback(bridge):
		return false

	var args_json := JSON.stringify(args)
	var started = bridge.eval("window.CidiGodotOnline.showRewardedAd(%s)" % args_json, true)
	return bool(started)


func _register_result_callback(bridge: Object) -> bool:
	if _result_callback != null:
		return true

	var online = bridge.eval("window.CidiGodotOnline", true)
	if online == null:
		return false

	_result_callback = bridge.create_callback(_on_bridge_result)
	online.setResultCallback(_result_callback)
	return true


func _on_bridge_result(args: Array) -> void:
	if args.size() < 2:
		return

	var action := str(args[0])
	var text := str(args[1])
	if text.is_empty():
		_resolve_bridge_result(action, {"success": false, "message": "Empty CIDI SDK response."})
		return

	var payload = JSON.parse_string(text)
	if typeof(payload) != TYPE_DICTIONARY:
		payload = {"success": false, "message": "Invalid CIDI SDK response."}

	_resolve_bridge_result(action, payload)


func _resolve_bridge_result(action: String, payload: Dictionary) -> void:
	if action != "showRewardedAd":
		return

	_rewarded_ad_pending = false
	if bool(payload.get("success", false)):
		_on_rewarded_ad_success(payload)
	else:
		_on_rewarded_ad_failed(payload)


func _on_rewarded_ad_success(payload: Dictionary) -> void:
	rewarded_ad_completed.emit()
	rewarded_ad_result.emit(_normalize_result(payload))


func _on_rewarded_ad_failed(payload: Dictionary) -> void:
	var result := _normalize_result(payload)
	rewarded_ad_failed.emit(_message_from_payload(result))
	rewarded_ad_result.emit(result)


func _get_bridge() -> Object:
	if not OS.has_feature("web"):
		return null
	if not Engine.has_singleton("JavaScriptBridge"):
		return null
	return Engine.get_singleton("JavaScriptBridge")


func _get_init_result() -> Dictionary:
	if _initialized:
		return _success_result()

	var bridge := _get_bridge()
	if bridge == null:
		return _failure_result("", "CIDI SDK can only be initialized from a Web export.")

	var ready = bridge.eval("window.CidiGodotOnline && window.CidiGodotOnline.isReady()", true)
	if bool(ready):
		_initialized = true
		return _success_result()

	return _failure_result("", "CIDI SDK was not initialized by the Web shell.")


func _message_from_payload(payload: Dictionary) -> String:
	var code := str(payload.get("code", ""))
	var message := str(payload.get("message", "Unknown CIDI SDK error."))
	if code.is_empty():
		return message
	return "%s: %s" % [code, message]


func _success_result() -> Dictionary:
	return {
		"success": true,
		"result": true,
		"code": "",
		"message": ""
	}


func _failure_result(code: String, message: String) -> Dictionary:
	return {
		"success": false,
		"result": null,
		"code": code,
		"message": message
	}


func _normalize_result(payload: Dictionary) -> Dictionary:
	return {
		"success": bool(payload.get("success", false)),
		"result": payload.get("result", null),
		"code": str(payload.get("code", "")),
		"message": str(payload.get("message", ""))
	}

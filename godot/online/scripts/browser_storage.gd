class_name BrowserStorage
extends RefCounted

const DEFAULT_PREFIX := "cidi-godot-online-demo:"

static var prefix := DEFAULT_PREFIX


static func configure(options := {}) -> void:
	prefix = str(options.get("prefix", DEFAULT_PREFIX))


static func set_value(key: String, value: Variant) -> bool:
	var bridge := _get_bridge()
	if bridge == null:
		return false

	var result = bridge.eval(
		"window.CidiGodotOnline.storage.set(%s, %s)" % [
			JSON.stringify(_build_key(key)),
			JSON.stringify(value)
		],
		true
	)
	return bool(result)


static func get_value(key: String, default_value: Variant = null) -> Variant:
	var bridge := _get_bridge()
	if bridge == null:
		return default_value

	var text = bridge.eval(
		"window.CidiGodotOnline.storage.get(%s)" % JSON.stringify(_build_key(key)),
		true
	)
	if typeof(text) != TYPE_STRING or text.is_empty():
		return default_value

	var parsed = JSON.parse_string(text)
	return default_value if parsed == null else parsed


static func remove_value(key: String) -> bool:
	var bridge := _get_bridge()
	if bridge == null:
		return false

	return bool(bridge.eval(
		"window.CidiGodotOnline.storage.remove(%s)" % JSON.stringify(_build_key(key)),
		true
	))


static func _build_key(key: String) -> String:
	return prefix + key


static func _get_bridge() -> Object:
	if not OS.has_feature("web"):
		return null
	if not Engine.has_singleton("JavaScriptBridge"):
		return null
	return Engine.get_singleton("JavaScriptBridge")

extends Control

const CidiSdkScript := preload("res://scripts/cidi_sdk.gd")
const BrowserStorageScript := preload("res://scripts/browser_storage.gd")

const REWARDED_AD_TIMEOUT := 30000
const COLOR_BACKGROUND := Color(0.06, 0.075, 0.095)
const COLOR_TEXT := Color(0.94, 0.97, 1.0)
const COLOR_MUTED_TEXT := Color(0.68, 0.76, 0.86)
const COLOR_BUTTON := Color(0.0, 0.48, 0.92)
const COLOR_BUTTON_HOVER := Color(0.0, 0.6, 1.0)
const COLOR_BUTTON_PRESSED := Color(0.0, 0.34, 0.72)
const COLOR_BUTTON_DISABLED := Color(0.25, 0.29, 0.34)

var _sdk: CidiSdk
var _status_label: Label
var _log_label: Label
var _show_ad_button: Button


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	BrowserStorageScript.configure({"prefix": "cidi-godot-online-demo:"})

	_sdk = CidiSdkScript.new()
	_sdk.configure({"rewarded_ad_timeout": REWARDED_AD_TIMEOUT})
	add_child(_sdk)

	_build_ui()
	_set_status("Initializing CIDI SDK...")
	_log("Demo scene started.")
	_init_cidi_sdk()


func _build_ui() -> void:
	var background := ColorRect.new()
	background.color = COLOR_BACKGROUND
	background.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var panel := VBoxContainer.new()
	panel.name = "Panel"
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(420, 320)
	panel.offset_left = -210
	panel.offset_top = -160
	panel.offset_right = 210
	panel.offset_bottom = 160
	panel.add_theme_constant_override("separation", 12)
	add_child(panel)

	var title := Label.new()
	title.text = "CIDI Godot Online Demo"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", COLOR_TEXT)
	panel.add_child(title)

	_status_label = Label.new()
	_status_label.text = "Waiting..."
	_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_status_label.add_theme_color_override("font_color", COLOR_MUTED_TEXT)
	panel.add_child(_status_label)

	var init_button := _create_button("Init CIDI SDK")
	init_button.pressed.connect(_init_cidi_sdk)
	panel.add_child(init_button)

	_show_ad_button = _create_button("Show Rewarded Ad")
	_show_ad_button.disabled = true
	_show_ad_button.pressed.connect(func(): _show_rewarded_ad())
	panel.add_child(_show_ad_button)

	var save_button := _create_button("Save Local State")
	save_button.pressed.connect(func(): _save_local_state())
	panel.add_child(save_button)

	var read_button := _create_button("Read Local State")
	read_button.pressed.connect(func(): _read_local_state())
	panel.add_child(read_button)

	_log_label = Label.new()
	_log_label.text = ""
	_log_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_log_label.custom_minimum_size = Vector2(420, 84)
	_log_label.add_theme_color_override("font_color", COLOR_MUTED_TEXT)
	panel.add_child(_log_label)


func _create_button(text: String) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(420, 44)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_color_override("font_color", COLOR_TEXT)
	button.add_theme_color_override("font_hover_color", COLOR_TEXT)
	button.add_theme_color_override("font_pressed_color", COLOR_TEXT)
	button.add_theme_color_override("font_disabled_color", Color(0.74, 0.78, 0.84))
	button.add_theme_stylebox_override("normal", _button_style(COLOR_BUTTON))
	button.add_theme_stylebox_override("hover", _button_style(COLOR_BUTTON_HOVER))
	button.add_theme_stylebox_override("pressed", _button_style(COLOR_BUTTON_PRESSED))
	button.add_theme_stylebox_override("disabled", _button_style(COLOR_BUTTON_DISABLED))
	button.button_down.connect(func(): _press_button(button))
	button.button_up.connect(func(): _release_button(button))
	button.mouse_exited.connect(func(): _release_button(button))
	return button


func _show_rewarded_ad() -> void:
	_set_status("Showing rewarded ad...")
	var result := await _sdk.show_rewarded_ad_async(REWARDED_AD_TIMEOUT)
	if bool(result.get("success", false)):
		_on_rewarded_ad_completed()
	else:
		_on_rewarded_ad_failed(_message_from_result(result))


func _save_local_state() -> void:
	var count := int(BrowserStorageScript.get_value("saveCount", 0)) + 1
	var ok := BrowserStorageScript.set_value("saveCount", count)
	if ok:
		_log("Saved local state. Count: %d" % count)
	else:
		_log("Local state save is only available in Web exports.")


func _read_local_state() -> void:
	var count := int(BrowserStorageScript.get_value("saveCount", 0))
	_log("Local state count: %d" % count)


func _init_cidi_sdk() -> void:
	var result := _sdk.init_cidi_sdk()
	if bool(result.get("success", false)):
		_set_status("CIDI SDK initialized.")
		_show_ad_button.disabled = false
		_log("CIDI SDK initialized successfully.")
	else:
		_set_status("CIDI SDK initialization failed.")
		_show_ad_button.disabled = true
		_log(_message_from_result(result))


func _on_rewarded_ad_completed() -> void:
	_set_status("Rewarded ad completed.")
	_log("Rewarded ad completed successfully.")


func _on_rewarded_ad_failed(message: String) -> void:
	_set_status("Rewarded ad failed.")
	_log(message)


func _message_from_result(result: Dictionary) -> String:
	var code := str(result.get("code", ""))
	var message := str(result.get("message", "Unknown CIDI SDK error."))
	if code.is_empty():
		return message
	return "%s: %s" % [code, message]


func _set_status(message: String) -> void:
	_status_label.text = message


func _log(message: String) -> void:
	print("[CIDI Demo] " + message)
	if _log_label:
		_log_label.text = message


func _press_button(button: Button) -> void:
	button.pivot_offset = button.size * 0.5
	button.scale = Vector2(0.96, 0.96)


func _release_button(button: Button) -> void:
	button.scale = Vector2.ONE


func _button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 16
	style.content_margin_right = 16
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	return style

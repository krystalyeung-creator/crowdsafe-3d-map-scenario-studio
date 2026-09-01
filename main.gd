extends Node

const WORLD_WIDTH: float = 1080.0
var crowd_world: CrowdWorld
var camera: Camera3D
var camera_yaw: float = -0.64
var camera_pitch: float = -0.58
var camera_distance: float = 48.0
var camera_dragging: bool = false
var fields: Dictionary = {}
var flow_option: OptionButton
var metering_check: CheckBox
var barriers_check: CheckBox
var metrics_label: RichTextLabel
var run_button: Button
var status_label: Label
var map_editor: MapEditor
var map_dialog: FileDialog
var map_status: Label
var calibration_distance: SpinBox
var imported_map_data: Dictionary = {}

func _ready() -> void:
	_build_world_view()
	_build_control_panel()
	crowd_world.metrics_updated.connect(_update_metrics)
	_apply_scenario()

func _panel_style(color: Color, radius: int = 12) -> StyleBoxFlat:
	var style: StyleBoxFlat = StyleBoxFlat.new(); style.bg_color = color
	style.corner_radius_top_left = radius; style.corner_radius_top_right = radius; style.corner_radius_bottom_left = radius; style.corner_radius_bottom_right = radius
	style.content_margin_left = 14; style.content_margin_right = 14; style.content_margin_top = 10; style.content_margin_bottom = 10
	return style

func _build_world_view() -> void:
	var container: SubViewportContainer = SubViewportContainer.new(); container.position = Vector2.ZERO; container.size = Vector2(WORLD_WIDTH, 900); container.stretch = true; container.mouse_filter = Control.MOUSE_FILTER_IGNORE; add_child(container)
	var viewport: SubViewport = SubViewport.new(); viewport.size = Vector2i(1080, 900); viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS; viewport.msaa_3d = Viewport.MSAA_4X; container.add_child(viewport)
	var world_environment: WorldEnvironment = WorldEnvironment.new(); var environment: Environment = Environment.new()
	environment.background_mode = Environment.BG_COLOR; environment.background_color = Color("#172029"); environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; environment.ambient_light_color = Color("#a7bac3"); environment.ambient_light_energy = 0.48
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC; environment.tonemap_exposure = 0.74; environment.tonemap_white = 6.0; environment.ssao_enabled = true; environment.ssao_radius = 2.2; environment.ssao_intensity = 2.0
	environment.fog_enabled = true; environment.fog_light_color = Color("#60727a"); environment.fog_density = 0.006; world_environment.environment = environment; viewport.add_child(world_environment)
	var sun: DirectionalLight3D = DirectionalLight3D.new(); sun.rotation_degrees = Vector3(-58, -32, 0); sun.light_color = Color("#d8e2df"); sun.light_energy = 0.72; sun.shadow_enabled = true; viewport.add_child(sun)
	crowd_world = CrowdWorld.new(); viewport.add_child(crowd_world)
	camera = Camera3D.new(); camera.current = true; camera.fov = 50.0; viewport.add_child(camera); _update_camera()
	var title: Label = Label.new(); title.text = "CROWDSAFE 3D  •  EDUCATIONAL CONCEPT MODEL"; title.position = Vector2(24, 24); title.add_theme_font_size_override("font_size", 17); title.add_theme_color_override("font_color", Color.WHITE); title.add_theme_stylebox_override("normal", _panel_style(Color(0.04, 0.07, 0.09, 0.84), 16)); add_child(title)
	var legend: Label = Label.new(); legend.text = "DENSITY  ● LOW   ● ELEVATED   ● HIGH   ● CRITICAL"; legend.position = Vector2(24, 820); legend.add_theme_font_size_override("font_size", 13); legend.add_theme_color_override("font_color", Color("#e9eee9")); legend.add_theme_stylebox_override("normal", _panel_style(Color(0.04, 0.07, 0.09, 0.80), 14)); add_child(legend)
	var hint: Label = Label.new(); hint.text = "DRAG: ORBIT  •  TWO-FINGER SCROLL / PINCH: ZOOM  •  +/-: ZOOM"; hint.position = Vector2(440, 820); hint.add_theme_font_size_override("font_size", 12); hint.add_theme_color_override("font_color", Color("#d4dcda")); hint.add_theme_stylebox_override("normal", _panel_style(Color(0.04, 0.07, 0.09, 0.72), 14)); add_child(hint)
	map_editor = MapEditor.new(); map_editor.position = Vector2.ZERO; map_editor.size = Vector2(WORLD_WIDTH, 900); map_editor.z_index = 20; map_editor.visible = false; map_editor.editor_changed.connect(_map_message); add_child(map_editor)

func _build_control_panel() -> void:
	var panel: PanelContainer = PanelContainer.new(); panel.position = Vector2(WORLD_WIDTH, 0); panel.size = Vector2(360, 900); panel.add_theme_stylebox_override("panel", _panel_style(Color("#101b21"), 0)); add_child(panel)
	var scroll: ScrollContainer = ScrollContainer.new(); scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED; panel.add_child(scroll)
	var root: VBoxContainer = VBoxContainer.new(); root.custom_minimum_size = Vector2(324, 1420); root.add_theme_constant_override("separation", 8); scroll.add_child(root)
	var brand: Label = Label.new(); brand.text = "SCENARIO STUDIO"; brand.add_theme_font_size_override("font_size", 25); brand.add_theme_color_override("font_color", Color("#d8e5df")); root.add_child(brand)
	var warning: Label = Label.new(); warning.text = "For education and comparative planning only.\nNot an engineering certification or forensic model."; warning.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; warning.add_theme_color_override("font_color", Color("#e0b989")); warning.add_theme_font_size_override("font_size", 12); root.add_child(warning)
	_add_section(root, "MAP IMPORT & TRACE")
	var import_button: Button = Button.new(); import_button.text = "IMPORT PNG / JPG SCREENSHOT"; import_button.pressed.connect(_open_map_dialog); root.add_child(import_button)
	calibration_distance = _spin_field(root, "Calibration distance", 1.0, 1000.0, 1.0, 20.0, " m")
	var tools_a: HBoxContainer = HBoxContainer.new(); var calibrate: Button = Button.new(); calibrate.text = "1 CALIBRATE"; calibrate.pressed.connect(func() -> void: _select_map_tool("calibrate")); tools_a.add_child(calibrate)
	var alley: Button = Button.new(); alley.text = "2 MAIN ALLEY"; alley.pressed.connect(func() -> void: _select_map_tool("alley")); tools_a.add_child(alley); root.add_child(tools_a)
	var tools_b: HBoxContainer = HBoxContainer.new(); var entries: Button = Button.new(); entries.text = "3 ENTRANCES"; entries.pressed.connect(func() -> void: _select_map_tool("entrance")); tools_b.add_child(entries)
	var shop_tool: Button = Button.new(); shop_tool.text = "4 SHOPS"; shop_tool.pressed.connect(func() -> void: _select_map_tool("shop")); tools_b.add_child(shop_tool); root.add_child(tools_b)
	var map_actions: HBoxContainer = HBoxContainer.new(); var preview: Button = Button.new(); preview.text = "SHOW MAP"; preview.pressed.connect(_toggle_map_editor); map_actions.add_child(preview)
	var generate: Button = Button.new(); generate.text = "GENERATE 3D"; generate.pressed.connect(_generate_from_map); map_actions.add_child(generate); root.add_child(map_actions)
	var clear_map: Button = Button.new(); clear_map.text = "CLEAR MAP / USE MANUAL STREET"; clear_map.pressed.connect(_clear_imported_map); root.add_child(clear_map)
	map_status = Label.new(); map_status.text = "No map imported"; map_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; map_status.add_theme_font_size_override("font_size", 11); map_status.add_theme_color_override("font_color", Color("#83b8b0")); root.add_child(map_status)
	_add_section(root, "AREA GEOMETRY")
	fields["width"] = _spin_field(root, "Street width", 3.0, 20.0, 0.5, 6.0, " m")
	fields["length"] = _spin_field(root, "Street length", 15.0, 120.0, 1.0, 45.0, " m")
	fields["slope"] = _spin_field(root, "Slope", 0.0, 25.0, 0.5, 8.0, " %")
	fields["shops"] = _spin_field(root, "Shops per side", 0.0, 20.0, 1.0, 6.0, "")
	_add_section(root, "CROWD INPUT")
	fields["people"] = _spin_field(root, "Starting people", 10.0, 800.0, 10.0, 350.0, "")
	fields["inflow"] = _spin_field(root, "Entering per minute", 0.0, 400.0, 5.0, 80.0, "")
	fields["outflow"] = _spin_field(root, "Exit capacity / minute", 1.0, 400.0, 5.0, 55.0, "")
	var flow_row: HBoxContainer = HBoxContainer.new(); var flow_label: Label = Label.new(); flow_label.text = "Walking pattern"; flow_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL; flow_row.add_child(flow_label)
	flow_option = OptionButton.new(); flow_option.add_item("Two-way", 0); flow_option.add_item("One-way", 1); flow_row.add_child(flow_option); root.add_child(flow_row)
	_add_section(root, "CROWD MANAGEMENT")
	metering_check = CheckBox.new(); metering_check.text = "Entrance metering"; root.add_child(metering_check)
	barriers_check = CheckBox.new(); barriers_check.text = "Directional divider barriers"; root.add_child(barriers_check)
	fields["staff"] = _spin_field(root, "Control staff", 0.0, 30.0, 1.0, 0.0, "")
	var apply: Button = Button.new(); apply.text = "APPLY / REBUILD SCENARIO"; apply.custom_minimum_size.y = 42; apply.pressed.connect(_apply_scenario); root.add_child(apply)
	var run_row: HBoxContainer = HBoxContainer.new(); run_button = Button.new(); run_button.text = "START"; run_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL; run_button.pressed.connect(_toggle_run); run_row.add_child(run_button)
	var reset: Button = Button.new(); reset.text = "RESET"; reset.pressed.connect(_apply_scenario); run_row.add_child(reset); root.add_child(run_row)
	_add_section(root, "LIVE READOUT")
	metrics_label = RichTextLabel.new(); metrics_label.bbcode_enabled = true; metrics_label.custom_minimum_size = Vector2(0, 150); metrics_label.add_theme_font_size_override("normal_font_size", 15); root.add_child(metrics_label)
	status_label = Label.new(); status_label.text = "Ready"; status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; status_label.add_theme_color_override("font_color", Color("#86b8a0")); root.add_child(status_label)
	var note: Label = Label.new(); note.text = "Density bands are simplified scenario indicators. Real crowd safety decisions require qualified professionals, validated geometry and observed data."; note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; note.add_theme_font_size_override("font_size", 11); note.add_theme_color_override("font_color", Color("#8da0a5")); root.add_child(note)
	map_dialog = FileDialog.new(); map_dialog.file_mode = FileDialog.FILE_MODE_OPEN_FILE; map_dialog.access = FileDialog.ACCESS_FILESYSTEM; map_dialog.filters = PackedStringArray(["*.png ; PNG images", "*.jpg,*.jpeg ; JPEG images"]); map_dialog.file_selected.connect(_map_file_selected); add_child(map_dialog)

func _add_section(parent: VBoxContainer, text: String) -> void:
	var label: Label = Label.new(); label.text = text; label.add_theme_font_size_override("font_size", 12); label.add_theme_color_override("font_color", Color("#69a9a3")); parent.add_child(label)

func _spin_field(parent: VBoxContainer, label_text: String, minimum: float, maximum: float, step: float, value: float, suffix: String) -> SpinBox:
	var row: HBoxContainer = HBoxContainer.new(); var label: Label = Label.new(); label.text = label_text; label.size_flags_horizontal = Control.SIZE_EXPAND_FILL; row.add_child(label)
	var field: SpinBox = SpinBox.new(); field.min_value = minimum; field.max_value = maximum; field.step = step; field.value = value; field.suffix = suffix; field.custom_minimum_size.x = 120; row.add_child(field); parent.add_child(row); return field

func _settings() -> Dictionary:
	return {"width": fields["width"].value, "length": fields["length"].value, "slope": fields["slope"].value, "shops": int(fields["shops"].value), "people": int(fields["people"].value), "inflow": fields["inflow"].value, "outflow": fields["outflow"].value, "flow_mode": flow_option.selected, "metering": metering_check.button_pressed, "barriers": barriers_check.button_pressed, "staff": int(fields["staff"].value), "map_data": imported_map_data}

func _apply_scenario() -> void:
	crowd_world.configure(_settings()); run_button.text = "START"; status_label.text = "Scenario rebuilt"
	camera_distance = clampf(float(fields["length"].value) * 0.88, 28.0, 82.0); _update_camera()

func _toggle_run() -> void:
	crowd_world.running = not crowd_world.running; run_button.text = "PAUSE" if crowd_world.running else "RESUME"; status_label.text = "Simulation running" if crowd_world.running else "Simulation paused"

func _open_map_dialog() -> void:
	map_dialog.popup_centered_ratio(0.82)

func _map_file_selected(path: String) -> void:
	if map_editor.load_screenshot(path): map_editor.visible = true

func _select_map_tool(tool: String) -> void:
	if map_editor.source_texture == null: map_status.text = "Import a screenshot first"; return
	map_editor.visible = true; map_editor.set_mode(tool)

func _toggle_map_editor() -> void:
	if map_editor.source_texture == null: map_status.text = "Import a screenshot first"; return
	map_editor.visible = not map_editor.visible

func _map_message(message: String) -> void:
	map_status.text = message

func _generate_from_map() -> void:
	var data: Dictionary = map_editor.get_map_data(calibration_distance.value)
	if not bool(data.get("ok", false)):
		map_status.text = "Need 2 calibration points and 2 main-alley points"; return
	imported_map_data = data; fields["length"].value = clampf(float(data["length"]), 15.0, 120.0)
	var mapped_shops: Array = data.get("shops", []); fields["shops"].value = ceili(float(mapped_shops.size()) / 2.0)
	map_editor.visible = false; _apply_scenario(); map_status.text = "3D generated from map: %d entrances, %d shops" % [(data.get("entrances", []) as Array).size(), mapped_shops.size()]

func _clear_imported_map() -> void:
	imported_map_data = {}; map_editor.clear_markers(); map_editor.visible = false; _apply_scenario(); map_status.text = "Manual straight-street mode"

func _update_metrics(data: Dictionary) -> void:
	var risk: String = String(data["risk"]); var risk_color: String = "#7fd49e"
	if risk == "ELEVATED": risk_color = "#e7ca58"
	elif risk == "HIGH": risk_color = "#ef873f"
	elif risk == "CRITICAL": risk_color = "#ef4b55"
	metrics_label.text = "[color=#7da9ac]VISIBLE PEOPLE[/color]  %d\n[color=#7da9ac]PEAK DENSITY[/color]  %.2f /m²\n[color=#7da9ac]AVERAGE SPEED[/color]  %.2f m/s\n[color=#7da9ac]ELAPSED[/color]  %.1f s\n[color=%s][font_size=22]RISK  %s[/font_size][/color]" % [int(data["people"]), float(data["peak_density"]), float(data["average_speed"]), float(data["elapsed"]), risk_color, risk]

func _input(event: InputEvent) -> void:
	if map_editor != null and map_editor.visible: return
	if event is InputEventMouseButton:
		var inside: bool = event.position.x < WORLD_WIDTH
		if event.button_index == MOUSE_BUTTON_LEFT and inside: camera_dragging = event.pressed
		if event.pressed and inside and event.button_index == MOUSE_BUTTON_WHEEL_UP: _zoom(-3.0); get_viewport().set_input_as_handled()
		if event.pressed and inside and event.button_index == MOUSE_BUTTON_WHEEL_DOWN: _zoom(3.0); get_viewport().set_input_as_handled()
	elif event is InputEventPanGesture and event.position.x < WORLD_WIDTH:
		_zoom(event.delta.y * 1.8); get_viewport().set_input_as_handled()
	elif event is InputEventMagnifyGesture and event.position.x < WORLD_WIDTH:
		_zoom((1.0 - event.factor) * 18.0); get_viewport().set_input_as_handled()
	elif event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_EQUAL or event.keycode == KEY_PLUS or event.keycode == KEY_KP_ADD: _zoom(-3.0)
		if event.keycode == KEY_MINUS or event.keycode == KEY_KP_SUBTRACT: _zoom(3.0)
	elif event is InputEventMouseMotion and camera_dragging:
		camera_yaw -= event.relative.x * 0.006; camera_pitch = clampf(camera_pitch - event.relative.y * 0.004, -1.05, -0.25); _update_camera()

func _zoom(amount: float) -> void:
	camera_distance = clampf(camera_distance + amount, 18.0, 95.0); _update_camera()

func _update_camera() -> void:
	if camera == null: return
	var midpoint_height: float = crowd_world.area_length * crowd_world.slope_percent / 200.0 if crowd_world != null else 2.0
	var focus: Vector3 = Vector3(0, midpoint_height, 0); var planar: float = cos(camera_pitch) * camera_distance
	camera.position = focus + Vector3(sin(camera_yaw) * planar, -sin(camera_pitch) * camera_distance, cos(camera_yaw) * planar); camera.look_at(focus, Vector3.UP)

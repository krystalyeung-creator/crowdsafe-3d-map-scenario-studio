class_name MapEditor
extends Control

signal editor_changed(message: String)

var source_texture: ImageTexture
var source_path: String = ""
var mode: String = "calibrate"
var calibration_points: Array[Vector2] = []
var alley_points: Array[Vector2] = []
var entrances: Array[Vector2] = []
var shops: Array[Vector2] = []
var image_rect: Rect2 = Rect2()

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process_unhandled_input(false)
	queue_redraw()

func load_screenshot(path: String) -> bool:
	var image: Image = Image.new()
	var error: Error = image.load(path)
	if error != OK:
		editor_changed.emit("Could not load image")
		return false
	source_texture = ImageTexture.create_from_image(image); source_path = path
	calibration_points.clear(); alley_points.clear(); entrances.clear(); shops.clear(); mode = "calibrate"
	_update_image_rect(); queue_redraw(); editor_changed.emit("Image loaded. Select two calibration points."); return true

func set_mode(next_mode: String) -> void:
	mode = next_mode
	var messages: Dictionary = {"calibrate": "Click two points with a known distance.", "alley": "Click the two ends of the main alley.", "entrance": "Click each entrance or feeder lane.", "shop": "Click shop locations. Right-click removes the last marker."}
	editor_changed.emit(String(messages.get(mode, "Map tool selected")))

func clear_markers() -> void:
	calibration_points.clear(); alley_points.clear(); entrances.clear(); shops.clear(); mode = "calibrate"; queue_redraw(); editor_changed.emit("Markers cleared")

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED:
		_update_image_rect(); queue_redraw()

func _update_image_rect() -> void:
	if source_texture == null: return
	var texture_size: Vector2 = source_texture.get_size(); var available: Vector2 = size
	var scale_factor: float = minf(available.x / texture_size.x, available.y / texture_size.y)
	var fitted: Vector2 = texture_size * scale_factor; image_rect = Rect2((available - fitted) * 0.5, fitted)

func _gui_input(event: InputEvent) -> void:
	if source_texture == null: return
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_RIGHT:
			_remove_last(); accept_event(); return
		if event.button_index != MOUSE_BUTTON_LEFT or not image_rect.has_point(event.position): return
		var point: Vector2 = event.position
		if mode == "calibrate":
			if calibration_points.size() >= 2: calibration_points.clear()
			calibration_points.append(point)
		elif mode == "alley":
			if alley_points.size() >= 2: alley_points.clear()
			alley_points.append(point)
		elif mode == "entrance": entrances.append(point)
		elif mode == "shop": shops.append(point)
		queue_redraw(); editor_changed.emit(_summary()); accept_event()

func _remove_last() -> void:
	if mode == "calibrate" and not calibration_points.is_empty(): calibration_points.pop_back()
	elif mode == "alley" and not alley_points.is_empty(): alley_points.pop_back()
	elif mode == "entrance" and not entrances.is_empty(): entrances.pop_back()
	elif mode == "shop" and not shops.is_empty(): shops.pop_back()
	queue_redraw(); editor_changed.emit(_summary())

func _summary() -> String:
	return "Calibration %d/2  •  Alley %d/2  •  Entrances %d  •  Shops %d" % [calibration_points.size(), alley_points.size(), entrances.size(), shops.size()]

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("#101820"))
	if source_texture == null:
		var font: Font = ThemeDB.fallback_font; draw_string(font, Vector2(310, 420), "IMPORT A MAP SCREENSHOT TO BEGIN", HORIZONTAL_ALIGNMENT_CENTER, 460, 22, Color("#9fb1b6")); return
	draw_texture_rect(source_texture, image_rect, false, Color(0.78, 0.78, 0.78, 0.90))
	draw_rect(image_rect, Color("#90a7ad"), false, 2.0)
	_draw_line_set(calibration_points, Color("#55d5e8"), "C")
	_draw_line_set(alley_points, Color("#f2d35f"), "A")
	for i: int in range(entrances.size()): _draw_marker(entrances[i], Color("#58d68d"), "E%d" % (i + 1))
	for i: int in range(shops.size()): _draw_marker(shops[i], Color("#df7ca5"), "S%d" % (i + 1))

func _draw_line_set(points: Array[Vector2], color: Color, prefix: String) -> void:
	if points.size() == 2: draw_line(points[0], points[1], color, 4.0, true)
	for i: int in range(points.size()): _draw_marker(points[i], color, "%s%d" % [prefix, i + 1])

func _draw_marker(point: Vector2, color: Color, label: String) -> void:
	draw_circle(point, 8.0, color); draw_circle(point, 12.0, Color(color, 0.42), false, 3.0)
	draw_string(ThemeDB.fallback_font, point + Vector2(12, -9), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color.WHITE)

func get_map_data(calibration_distance_m: float) -> Dictionary:
	if calibration_points.size() != 2 or alley_points.size() != 2 or calibration_distance_m <= 0.0: return {"ok": false}
	var calibration_pixels: float = calibration_points[0].distance_to(calibration_points[1])
	if calibration_pixels < 5.0: return {"ok": false}
	var pixels_per_meter: float = calibration_pixels / calibration_distance_m
	var alley_vector: Vector2 = alley_points[1] - alley_points[0]; var alley_pixels: float = alley_vector.length()
	if alley_pixels < 10.0: return {"ok": false}
	var unit: Vector2 = alley_vector / alley_pixels
	var entry_data: Array[Dictionary] = []
	for point: Vector2 in entrances: entry_data.append(_project_marker(point, alley_points[0], unit, alley_pixels))
	var shop_data: Array[Dictionary] = []
	for point: Vector2 in shops: shop_data.append(_project_marker(point, alley_points[0], unit, alley_pixels))
	return {"ok": true, "length": alley_pixels / pixels_per_meter, "pixels_per_meter": pixels_per_meter, "entrances": entry_data, "shops": shop_data, "source_path": source_path}

func _project_marker(point: Vector2, origin: Vector2, unit: Vector2, alley_pixels: float) -> Dictionary:
	var relative: Vector2 = point - origin; var projected: float = relative.dot(unit); var cross: float = unit.x * relative.y - unit.y * relative.x
	return {"t": clampf(projected / alley_pixels, 0.0, 1.0), "side": 1 if cross >= 0.0 else -1, "offset_px": absf(cross)}

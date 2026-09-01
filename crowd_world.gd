class_name CrowdWorld
extends Node3D

signal metrics_updated(data: Dictionary)

const SEGMENTS: int = 12
const MAX_VISIBLE_AGENTS: int = 800

var area_width: float = 6.0
var area_length: float = 45.0
var slope_percent: float = 8.0
var shops_per_side: int = 6
var target_people: int = 350
var inflow_per_minute: float = 80.0
var outflow_per_minute: float = 55.0
var flow_mode: int = 0
var metering_enabled: bool = false
var barriers_enabled: bool = false
var staff_count: int = 0
var map_layout: Dictionary = {}
var map_mode: bool = false
var running: bool = false
var elapsed: float = 0.0
var spawn_accumulator: float = 0.0
var exit_accumulator: float = 0.0
var metric_accumulator: float = 0.0
var agents: Array[Dictionary] = []
var agent_nodes: Array[MeshInstance3D] = []
var heat_tiles: Array[MeshInstance3D] = []
var segment_counts: Array[int] = []
var geometry_root: Node3D
var crowd_root: Node3D
var heat_root: Node3D
var person_mesh: CapsuleMesh
var uphill_material: StandardMaterial3D
var downhill_material: StandardMaterial3D
var rng: RandomNumberGenerator = RandomNumberGenerator.new()

func _ready() -> void:
	rng.seed = 2901993
	person_mesh = CapsuleMesh.new(); person_mesh.radius = 0.16; person_mesh.height = 0.72; person_mesh.radial_segments = 5; person_mesh.rings = 2
	uphill_material = _material(Color("#78a9c4"), 0.76)
	downhill_material = _material(Color("#d5946f"), 0.76)
	configure({})

func _material(color: Color, roughness: float = 0.82) -> StandardMaterial3D:
	var material: StandardMaterial3D = StandardMaterial3D.new(); material.albedo_color = color; material.roughness = roughness; return material

func configure(settings: Dictionary) -> void:
	area_width = float(settings.get("width", area_width)); area_length = float(settings.get("length", area_length)); slope_percent = float(settings.get("slope", slope_percent))
	shops_per_side = int(settings.get("shops", shops_per_side)); target_people = int(settings.get("people", target_people)); inflow_per_minute = float(settings.get("inflow", inflow_per_minute)); outflow_per_minute = float(settings.get("outflow", outflow_per_minute))
	flow_mode = int(settings.get("flow_mode", flow_mode)); metering_enabled = bool(settings.get("metering", metering_enabled)); barriers_enabled = bool(settings.get("barriers", barriers_enabled)); staff_count = int(settings.get("staff", staff_count))
	map_layout = settings.get("map_data", {}) as Dictionary; map_mode = bool(map_layout.get("ok", false))
	if map_mode: area_length = clampf(float(map_layout.get("length", area_length)), 15.0, 120.0)
	running = false; elapsed = 0.0; spawn_accumulator = 0.0; exit_accumulator = 0.0; metric_accumulator = 0.0
	_clear_world(); _build_geometry(); _spawn_initial_people(); _update_density_and_metrics()

func _clear_world() -> void:
	for child: Node in get_children(): child.queue_free()
	agents.clear(); agent_nodes.clear(); heat_tiles.clear(); segment_counts.clear()
	geometry_root = Node3D.new(); geometry_root.name = "ScenarioGeometry"; add_child(geometry_root)
	heat_root = Node3D.new(); heat_root.name = "DensityHeatmap"; add_child(heat_root)
	crowd_root = Node3D.new(); crowd_root.name = "CrowdAgents"; add_child(crowd_root)

func _box(size: Vector3, pos: Vector3, material: Material, parent: Node3D, rot_y: float = 0.0) -> MeshInstance3D:
	var mesh: BoxMesh = BoxMesh.new(); mesh.size = size
	var node: MeshInstance3D = MeshInstance3D.new(); node.mesh = mesh; node.material_override = material; node.position = pos; node.rotation.y = rot_y; parent.add_child(node); return node

func _height_at(z: float) -> float:
	return (z + area_length * 0.5) * slope_percent / 100.0

func _build_geometry() -> void:
	var road_material: StandardMaterial3D = _material(Color("#555a5f"))
	var curb_material: StandardMaterial3D = _material(Color("#959087"))
	var shop_material: StandardMaterial3D = _material(Color("#34363c"))
	var shop_alt_material: StandardMaterial3D = _material(Color("#45363a"))
	var glass_material: StandardMaterial3D = _material(Color("#243b47"), 0.22)
	var angle: float = -atan(slope_percent / 100.0)
	var road: MeshInstance3D = _box(Vector3(area_width, 0.22, area_length), Vector3(0, _height_at(0.0) - 0.12, 0), road_material, geometry_root); road.rotation.x = angle
	for side: float in [-1.0, 1.0]:
		var curb: MeshInstance3D = _box(Vector3(0.32, 0.42, area_length), Vector3(side * (area_width * 0.5 + 0.16), _height_at(0.0), 0), curb_material, geometry_root); curb.rotation.x = angle
	if barriers_enabled:
		var divider: MeshInstance3D = _box(Vector3(0.10, 0.65, area_length * 0.82), Vector3(0, _height_at(0.0) + 0.38, 0), _material(Color("#d8b64e")), geometry_root); divider.rotation.x = angle
	if map_mode:
		_build_imported_features(shop_material, shop_alt_material, glass_material)
	else:
		var shop_spacing: float = area_length / float(maxi(1, shops_per_side))
		for side: int in [-1, 1]:
			for i: int in range(shops_per_side):
				var z: float = -area_length * 0.5 + shop_spacing * (float(i) + 0.5)
				var depth: float = 3.4 + float(i % 3) * 0.45
				var x: float = float(side) * (area_width * 0.5 + depth * 0.5 + 0.48)
				var shop: MeshInstance3D = _box(Vector3(depth, 3.8, shop_spacing * 0.82), Vector3(x, _height_at(z) + 1.9, z), shop_material if i % 2 == 0 else shop_alt_material, geometry_root); shop.rotation.x = angle
				_box(Vector3(0.08, 1.55, shop_spacing * 0.52), Vector3(float(side) * (area_width * 0.5 + 0.51), _height_at(z) + 1.35, z), glass_material, geometry_root)
	for segment: int in range(SEGMENTS):
		var tile_length: float = area_length / float(SEGMENTS)
		var tile_z: float = -area_length * 0.5 + tile_length * (float(segment) + 0.5)
		var tile_material: StandardMaterial3D = _material(Color(0.15, 0.72, 0.38, 0.44), 0.72); tile_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		var tile: MeshInstance3D = _box(Vector3(area_width * 0.94, 0.035, tile_length * 0.92), Vector3(0, _height_at(tile_z) + 0.05, tile_z), tile_material, heat_root); tile.rotation.x = angle; heat_tiles.append(tile); segment_counts.append(0)
	_build_control_staff()

func _build_imported_features(shop_material: Material, shop_alt_material: Material, glass_material: Material) -> void:
	var feeder_material: StandardMaterial3D = _material(Color("#4a5157"))
	var entrances: Array = map_layout.get("entrances", [])
	for i: int in range(entrances.size()):
		var entry: Dictionary = entrances[i]; var z: float = -area_length * 0.5 + float(entry.get("t", 0.5)) * area_length; var side: float = float(entry.get("side", 1))
		_box(Vector3(8.0, 0.18, 2.5), Vector3(side * (area_width * 0.5 + 4.0), _height_at(z) - 0.05, z), feeder_material, geometry_root)
		_box(Vector3(0.18, 0.28, 2.7), Vector3(side * (area_width * 0.5 + 7.9), _height_at(z) + 0.12, z), _material(Color("#65c99b")), geometry_root)
	var mapped_shops: Array = map_layout.get("shops", [])
	for i: int in range(mapped_shops.size()):
		var marker: Dictionary = mapped_shops[i]; var z: float = -area_length * 0.5 + float(marker.get("t", 0.5)) * area_length; var side: float = float(marker.get("side", 1)); var x: float = side * (area_width * 0.5 + 2.2)
		_box(Vector3(3.4, 3.6, 3.2), Vector3(x, _height_at(z) + 1.8, z), shop_material if i % 2 == 0 else shop_alt_material, geometry_root)
		_box(Vector3(0.10, 1.45, 1.8), Vector3(side * (area_width * 0.5 + 0.53), _height_at(z) + 1.30, z), glass_material, geometry_root)

func _build_control_staff() -> void:
	var staff_material: StandardMaterial3D = _material(Color("#ead24e"))
	for i: int in range(staff_count):
		var z: float = -area_length * 0.42 + float(i % 8) * area_length * 0.11
		var side: float = -1.0 if i % 2 == 0 else 1.0
		var mesh: CapsuleMesh = CapsuleMesh.new(); mesh.radius = 0.19; mesh.height = 0.90; mesh.radial_segments = 5; mesh.rings = 2
		var node: MeshInstance3D = MeshInstance3D.new(); node.mesh = mesh; node.material_override = staff_material; node.position = Vector3(side * (area_width * 0.40), _height_at(z) + 0.52, z); geometry_root.add_child(node)

func _spawn_initial_people() -> void:
	var count: int = mini(target_people, MAX_VISIBLE_AGENTS)
	for i: int in range(count):
		var direction: int = 1 if flow_mode == 1 or i % 2 == 0 else -1
		if map_mode and not (map_layout.get("entrances", []) as Array).is_empty(): _spawn_from_mapped_entrance(i, direction)
		else: _spawn_agent(Vector3(rng.randf_range(-area_width * 0.43, area_width * 0.43), 0, rng.randf_range(-area_length * 0.48, area_length * 0.48)), direction)

func _spawn_from_mapped_entrance(index: int, direction: int) -> void:
	var entries: Array = map_layout.get("entrances", []); var entry: Dictionary = entries[index % entries.size()]
	var z: float = -area_length * 0.5 + float(entry.get("t", 0.5)) * area_length; var side: float = float(entry.get("side", 1))
	_spawn_agent(Vector3(side * (area_width * 0.5 + rng.randf_range(3.0, 7.0)), 0, z + rng.randf_range(-0.9, 0.9)), direction, true)

func _spawn_agent(pos: Vector3, direction: int, merging: bool = false) -> void:
	if agents.size() >= MAX_VISIBLE_AGENTS: return
	pos.y = _height_at(pos.z) + 0.42
	var node: MeshInstance3D = MeshInstance3D.new(); node.mesh = person_mesh; node.material_override = uphill_material if direction > 0 else downhill_material; node.position = pos; crowd_root.add_child(node)
	agents.append({"pos": pos, "direction": direction, "phase": rng.randf_range(0.0, TAU), "speed": rng.randf_range(0.92, 1.28), "merging": merging}); agent_nodes.append(node)

func _process(delta: float) -> void:
	if not running: return
	elapsed += delta; spawn_accumulator += delta; exit_accumulator += delta * outflow_per_minute / 60.0; metric_accumulator += delta
	var effective_inflow: float = inflow_per_minute
	if metering_enabled: effective_inflow *= 0.48
	if staff_count > 0: effective_inflow *= maxf(0.58, 1.0 - float(staff_count) * 0.025)
	var spawn_interval: float = 60.0 / maxf(1.0, effective_inflow)
	while spawn_accumulator >= spawn_interval:
		spawn_accumulator -= spawn_interval
		var direction: int = 1 if flow_mode == 1 or rng.randf() > 0.5 else -1
		var entry_z: float = -area_length * 0.49 if direction > 0 else area_length * 0.49
		if map_mode and not (map_layout.get("entrances", []) as Array).is_empty(): _spawn_from_mapped_entrance(rng.randi(), direction)
		else: _spawn_agent(Vector3(rng.randf_range(-area_width * 0.42, area_width * 0.42), 0, entry_z), direction)
	_update_segment_counts()
	var remove_indices: Array[int] = []
	for i: int in range(agents.size()):
		var agent: Dictionary = agents[i]
		var pos: Vector3 = agent["pos"]
		var segment: int = clampi(int((pos.z + area_length * 0.5) / area_length * float(SEGMENTS)), 0, SEGMENTS - 1)
		var segment_area: float = area_width * area_length / float(SEGMENTS)
		var local_density: float = float(segment_counts[segment]) / segment_area
		var speed_factor: float = clampf(1.0 - maxf(0.0, local_density - 1.2) * 0.145, 0.04, 1.0)
		var merging: bool = bool(agent.get("merging", false))
		if merging:
			pos.x = move_toward(pos.x, 0.0, delta * maxf(0.35, float(agent["speed"]) * speed_factor))
			if absf(pos.x) <= area_width * 0.42:
				agent["merging"] = false; merging = false
		if not merging:
			if barriers_enabled and flow_mode == 0:
				var desired_side: float = -area_width * 0.22 if int(agent["direction"]) > 0 else area_width * 0.22
				pos.x = move_toward(pos.x, desired_side, delta * 0.55)
			var sway: float = sin(elapsed * 1.7 + float(agent["phase"])) * 0.025
			pos.x = clampf(pos.x + sway * delta, -area_width * 0.44, area_width * 0.44)
			pos.z += float(agent["direction"]) * float(agent["speed"]) * speed_factor * delta
		pos.y = _height_at(pos.z) + 0.42 + absf(sin(elapsed * 4.0 + float(agent["phase"]))) * 0.025
		agent["pos"] = pos; agents[i] = agent; agent_nodes[i].position = pos
		if absf(pos.z) > area_length * 0.50:
			if exit_accumulator >= 1.0:
				exit_accumulator -= 1.0; remove_indices.push_front(i)
			else:
				pos.z = clampf(pos.z, -area_length * 0.50, area_length * 0.50); agent["pos"] = pos; agents[i] = agent; agent_nodes[i].position = pos
	for index: int in remove_indices:
		agent_nodes[index].queue_free(); agent_nodes.remove_at(index); agents.remove_at(index)
	if metric_accumulator >= 0.35:
		metric_accumulator = 0.0; _update_density_and_metrics()

func _update_segment_counts() -> void:
	for i: int in range(SEGMENTS): segment_counts[i] = 0
	for agent: Dictionary in agents:
		var pos: Vector3 = agent["pos"]
		var segment: int = clampi(int((pos.z + area_length * 0.5) / area_length * float(SEGMENTS)), 0, SEGMENTS - 1)
		segment_counts[segment] += 1

func _update_density_and_metrics() -> void:
	_update_segment_counts()
	var segment_area: float = area_width * area_length / float(SEGMENTS)
	var peak_density: float = 0.0
	var total_speed: float = 0.0
	for i: int in range(SEGMENTS):
		var density: float = float(segment_counts[i]) / segment_area
		peak_density = maxf(peak_density, density)
		var color: Color = Color(0.12, 0.72, 0.36, 0.42)
		if density >= 6.0: color = Color(0.88, 0.10, 0.12, 0.62)
		elif density >= 4.0: color = Color(0.96, 0.36, 0.08, 0.56)
		elif density >= 2.0: color = Color(0.92, 0.72, 0.12, 0.50)
		(heat_tiles[i].material_override as StandardMaterial3D).albedo_color = color
	for agent: Dictionary in agents:
		var pos: Vector3 = agent["pos"]; var segment: int = clampi(int((pos.z + area_length * 0.5) / area_length * float(SEGMENTS)), 0, SEGMENTS - 1)
		var density: float = float(segment_counts[segment]) / segment_area; total_speed += float(agent["speed"]) * clampf(1.0 - maxf(0.0, density - 1.2) * 0.145, 0.04, 1.0)
	var average_speed: float = total_speed / float(maxi(1, agents.size()))
	var risk: String = "LOW"
	if peak_density >= 6.0: risk = "CRITICAL"
	elif peak_density >= 4.0: risk = "HIGH"
	elif peak_density >= 2.0: risk = "ELEVATED"
	metrics_updated.emit({"people": agents.size(), "peak_density": peak_density, "average_speed": average_speed, "risk": risk, "elapsed": elapsed})

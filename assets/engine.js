// ─── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://tool.knxstore.vn',
  'https://knxstore.vn'
];

// ─── SYSTEM INFO ──────────────────────────────────────────────────────────────
const sysInfo = {
  lt:   { name_en: 'Lighting',      name_vi: 'Chiếu sáng',         desc_en: 'Switching, dimming, CCT and RGBW circuits.',      desc_vi: 'Điều khiển bật/tắt, dim, nhiệt độ màu, RGBW.',      main: 1, midScheme: 'gatype', icon: 'light', gaNames: ['SW','FB','DIM','VAL','VALFB','CCT','CCT_FB','RGB','RGB_FB'] },
  pres: { name_en: 'Presence',      name_vi: 'Cảm biến hiện diện', desc_en: 'Motion sensors with lux value and lock.',         desc_vi: 'Cảm biến chuyển động với giá trị lux và khoá.',      main: 2, midScheme: 'gatype', icon: 'pres',  gaNames: ['STATUS','LUX','LOCK'] },
  sht:  { name_en: 'Shutter',       name_vi: 'Rèm / Mành',         desc_en: 'Up/down, position, tilt and safety lockout.',     desc_vi: 'Lên/xuống, vị trí, góc cánh và khoá an toàn.',      main: 3, midScheme: 'gatype', icon: 'sht',   gaNames: ['MOVE','STEP','POS','POS_FB','TILT','TILT_FB','WIND','RAIN'] },
  hvac: { name_en: 'HVAC',          name_vi: 'HVAC',                desc_en: 'Temperature, setpoint, mode and fan speed.',      desc_vi: 'Nhiệt độ, cài đặt, chế độ và tốc độ quạt.',         main: 4, mainFb: 5, nameFb_en: 'HVAC Feedback', nameFb_vi: 'HVAC - Phản hồi', midScheme: 'gatype', icon: 'hvac',  gaNames: ['ENABLE','SETP','MODE','FAN','TEMP_ACT','SETP_FB','MODE_FB','FAN_FB','VALVE_FB','ENABLE_FB'] },
  sec:  { name_en: 'Security',      name_vi: 'An ninh',             desc_en: 'Burglar zones, door sensors, fire and siren.',    desc_vi: 'Vùng báo trộm, cảm biến cửa, báo cháy, còi.',       main: 10, icon: 'sec',   gaNames: ['ARM_AWAY','ARM_HOME','DISARM','STATUS_FB','ZONE_STATUS','FIRE','SIREN'] },
  scn:  { name_en: 'Scenes',        name_vi: 'Cảnh (Scenes)',       desc_en: 'Central and per-room scene activation.',          desc_vi: 'Kích hoạt cảnh trung tâm và theo từng phòng.',       main: 6, icon: 'scn',   gaNames: ['ACTIVATE','FB'] },
  av:   { name_en: 'Audio Visual',  name_vi: 'Nghe nhìn',           desc_en: 'TV/amp power, source, volume and mute.',          desc_vi: 'Nguồn TV/amp, chọn đầu vào, âm lượng, tắt tiếng.',  main: 7, icon: 'av',    gaNames: ['POWER','SOURCE','VOL','VOL_FB','MUTE'] },
  nrg:  { name_en: 'Energy',        name_vi: 'Giám sát điện',       desc_en: 'Power, energy, voltage and current per circuit.', desc_vi: 'Công suất, điện năng, điện áp, dòng điện.',         main: 8, icon: 'nrg',   gaNames: ['POWER','ENERGY','VOLTAGE','CURRENT'] },
  sys:  { name_en: 'System logic',  name_vi: 'Logic hệ thống',      desc_en: 'Time, date, sunrise/sunset and occupancy mode.',  desc_vi: 'Thời gian, ngày tháng, mặt trời và chế độ.',        main: 9, icon: 'sys',   gaNames: ['TIME','DATE','SUNRISE','SUNSET','OCC_MODE','HEARTBEAT'] }
};

// ─── PREFIX MAPS ──────────────────────────────────────────────────────────────
const prefix = {
  lt: 'LT', pres: 'PRES', sht: 'SHT', hvac: 'HVAC',
  sec: 'SEC', scn: 'SCN', av: 'AV', nrg: 'NRG', sys: 'SYS'
};

const floorPrefix = {
  0: 'CTRL', 1: 'BAS', 2: 'GF',
  3: 'FL1',  4: 'FL2', 5: 'FL3', 6: 'FL4', 7: 'OUT'
};

// ─── GA SETS ──────────────────────────────────────────────────────────────────
// o = offset label, n = short name, full = full name, dpt = KNX DPT, t = ctrl|fb
const gasets = {
  lt: [
    { o: '+0', n: 'SW',     full: 'Switch',              dpt: 'DPST-1-001',   t: 'ctrl' },
    { o: '+1', n: 'FB',     full: 'Switch feedback',     dpt: 'DPST-1-001',   t: 'fb'   },
    { o: '+2', n: 'DIM',    full: 'Dimming step',        dpt: 'DPST-3-007',   t: 'ctrl' },
    { o: '+3', n: 'VAL',    full: 'Brightness value',    dpt: 'DPST-5-001',   t: 'ctrl' },
    { o: '+4', n: 'VALFB',  full: 'Brightness feedback', dpt: 'DPST-5-001',   t: 'fb'   },
    { o: '+5', n: 'CCT',    full: 'Colour temperature',  dpt: 'DPST-9-001',   t: 'ctrl' },
    { o: '+6', n: 'CCT_FB', full: 'Colour temp FB',      dpt: 'DPST-9-001',   t: 'fb'   },
    { o: '+7', n: 'RGB',    full: 'RGBW colour',         dpt: 'DPST-232-600', t: 'ctrl' },
    { o: '+8', n: 'RGB_FB', full: 'RGBW feedback',       dpt: 'DPST-232-600', t: 'fb'   }
  ],
  pres: [
    { o: '+0', n: 'STATUS', full: 'Occupancy status', dpt: 'DPST-1-001', t: 'fb'   },
    { o: '+1', n: 'LUX',    full: 'Brightness lux',   dpt: 'DPST-9-004', t: 'fb'   },
    { o: '+2', n: 'LOCK',   full: 'Sensor lock',      dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  sht: [
    { o: '+0', n: 'MOVE',    full: 'Up / Down',          dpt: 'DPST-1-008', t: 'ctrl' },
    { o: '+1', n: 'STEP',    full: 'Step / Stop',        dpt: 'DPST-1-007', t: 'ctrl' },
    { o: '+2', n: 'POS',     full: 'Position 0–255',     dpt: 'DPST-5-001', t: 'ctrl' },
    { o: '+3', n: 'POS_FB',  full: 'Position feedback',  dpt: 'DPST-5-001', t: 'fb'   },
    { o: '+4', n: 'TILT',    full: 'Slat angle',         dpt: 'DPST-5-001', t: 'ctrl' },
    { o: '+5', n: 'TILT_FB', full: 'Slat feedback',      dpt: 'DPST-5-001', t: 'fb'   },
    { o: '+6', n: 'WIND',    full: 'Wind alarm',         dpt: 'DPST-1-005', t: 'fb'   },
    { o: '+7', n: 'RAIN',    full: 'Rain alarm',         dpt: 'DPST-1-005', t: 'fb'   }
  ],
  hvac: [
    { o:  '+0', n: 'ENABLE',      full: 'On / Off',              dpt: 'DPST-1-001',  t: 'ctrl' },
    { o:  '+1', n: 'SETP',        full: 'Setpoint',              dpt: 'DPST-9-001',  t: 'ctrl' },
    { o:  '+2', n: 'MODE',        full: 'HVAC mode',             dpt: 'DPST-20-102', t: 'ctrl' },
    { o:  '+3', n: 'FAN',         full: 'Fan speed',             dpt: 'DPST-5-001',  t: 'ctrl' },
    { o:  '+4', n: 'SETP_OFFSET', full: 'Setpoint offset',       dpt: 'DPST-9-002',  t: 'ctrl' },
    { o:  '+5', n: 'VALVE_CMD',   full: 'Valve command',         dpt: 'DPST-5-001',  t: 'ctrl' },
    { o:  '+6', n: 'SWING',       full: 'Swing / louver',        dpt: 'DPST-5-010',  t: 'ctrl' },
    { o:  '+7', n: 'LOCK',        full: 'Remote lock',           dpt: 'DPST-1-001',  t: 'ctrl' },
    { o:  '+8', n: 'TEMP_ACT',    full: 'Actual temperature',    dpt: 'DPST-9-001',  t: 'fb'   },
    { o:  '+9', n: 'SETP_FB',     full: 'Setpoint feedback',     dpt: 'DPST-9-001',  t: 'fb'   },
    { o: '+10', n: 'MODE_FB',     full: 'Mode feedback',         dpt: 'DPST-20-102', t: 'fb'   },
    { o: '+11', n: 'FAN_FB',      full: 'Fan speed feedback',    dpt: 'DPST-5-001',  t: 'fb'   },
    { o: '+12', n: 'VALVE_FB',    full: 'Valve output feedback', dpt: 'DPST-5-001',  t: 'fb'   },
    { o: '+13', n: 'HUMIDITY',    full: 'Humidity',              dpt: 'DPST-9-007',  t: 'fb'   },
    { o: '+14', n: 'ENABLE_FB',   full: 'On/Off feedback',       dpt: 'DPST-1-001',  t: 'fb'   }
  ],
  sec: [
    { o: '+0', n: 'ARM_AWAY',    full: 'Arm away',     dpt: 'DPST-1-001', t: 'ctrl' },
    { o: '+1', n: 'ARM_HOME',    full: 'Arm home',     dpt: 'DPST-1-001', t: 'ctrl' },
    { o: '+2', n: 'DISARM',      full: 'Disarm',       dpt: 'DPST-1-001', t: 'ctrl' },
    { o: '+3', n: 'STATUS_FB',   full: 'Arm status',   dpt: 'DPST-1-001', t: 'fb'   },
    { o: '+4', n: 'ZONE_STATUS', full: 'Zone status',  dpt: 'DPST-1-005', t: 'fb'   },
    { o: '+5', n: 'FIRE',        full: 'Fire alarm',   dpt: 'DPST-1-005', t: 'fb'   },
    { o: '+6', n: 'SIREN',       full: 'Siren output', dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  scn: [
    { o: '+0', n: 'ACTIVATE', full: 'Scene activate',  dpt: 'DPST-18-001', t: 'ctrl' },
    { o: '+1', n: 'FB',       full: 'Active scene FB', dpt: 'DPST-18-001', t: 'fb'   }
  ],
  av: [
    { o: '+0', n: 'POWER',  full: 'Power on/off',    dpt: 'DPST-1-001', t: 'ctrl' },
    { o: '+1', n: 'SOURCE', full: 'Source select',   dpt: 'DPST-5-001', t: 'ctrl' },
    { o: '+2', n: 'VOL',    full: 'Volume 0–255',    dpt: 'DPST-5-001', t: 'ctrl' },
    { o: '+3', n: 'VOL_FB', full: 'Volume feedback', dpt: 'DPST-5-001', t: 'fb'   },
    { o: '+4', n: 'MUTE',   full: 'Mute toggle',     dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  nrg: [
    { o: '+0', n: 'POWER',   full: 'Active power W',   dpt: 'DPST-14-056', t: 'fb' },
    { o: '+1', n: 'ENERGY',  full: 'Energy kWh',       dpt: 'DPST-13-010', t: 'fb' },
    { o: '+2', n: 'VOLTAGE', full: 'Voltage V',        dpt: 'DPST-14-027', t: 'fb' },
    { o: '+3', n: 'CURRENT', full: 'Current A',        dpt: 'DPST-14-019', t: 'fb' }
  ],
  sys: [
    { o: '+0', n: 'TIME',      full: 'Current time',    dpt: 'DPST-10-001', t: 'fb'   },
    { o: '+1', n: 'DATE',      full: 'Current date',    dpt: 'DPST-11-001', t: 'fb'   },
    { o: '+2', n: 'SUNRISE',   full: 'Sunrise time',    dpt: 'DPST-10-001', t: 'fb'   },
    { o: '+3', n: 'SUNSET',    full: 'Sunset time',     dpt: 'DPST-10-001', t: 'fb'   },
    { o: '+4', n: 'OCC_MODE',  full: 'Occupancy mode',  dpt: 'DPST-5-001',  t: 'ctrl' },
    { o: '+5', n: 'HEARTBEAT', full: 'Diagnostic ping', dpt: 'DPST-1-001',  t: 'fb'   }
  ]
};

// ─── CIRCUIT DEFINITIONS ──────────────────────────────────────────────────────
// circuits[fi][ri][sk][circuitKey] = string[] (user-given names)
const circuitDefs = {
  lt:   [['onoff', 'On/Off'], ['dim', 'Dimming'], ['cct', 'CCT'], ['rgb', 'RGBW']],
  pres: [['sensor', 'Sensor']],
  sht:  [['motor', 'Motor']],
  hvac: [['unit', 'HVAC unit']],
  sec:  [['zone', 'Zone']],
  scn:  [['scene', 'Scene group']],
  av:   [['unit', 'AV unit']],
  nrg:  [['meter', 'Meter']],
  sys:  [['unit', 'Unit']]
};

// ─── CIRCUIT GA SETS ──────────────────────────────────────────────────────────
// Subset of gasets used per circuit type — key: `${sysKey}_${circuitKey}`
const circuitGaSet = {
  lt_onoff: [
    { n: 'SW', full: 'Switch',          dpt: 'DPST-1-001', t: 'ctrl', mid: 0, midName: 'SW' },
    { n: 'FB', full: 'Switch feedback', dpt: 'DPST-1-001', t: 'fb',   mid: 1, midName: 'FB' }
  ],
  lt_dim: [
    { n: 'SW',    full: 'Switch',              dpt: 'DPST-1-001', t: 'ctrl', mid: 0, midName: 'SW'    },
    { n: 'FB',    full: 'Switch feedback',     dpt: 'DPST-1-001', t: 'fb',   mid: 1, midName: 'FB'    },
    { n: 'DIM',   full: 'Dimming step',        dpt: 'DPST-3-007', t: 'ctrl', mid: 2, midName: 'DIM'   },
    { n: 'VAL',   full: 'Brightness value',    dpt: 'DPST-5-001', t: 'ctrl', mid: 3, midName: 'VAL'   },
    { n: 'VALFB', full: 'Brightness feedback', dpt: 'DPST-5-001', t: 'fb',   mid: 4, midName: 'VALFB' }
  ],
  lt_cct: [
    { n: 'SW',     full: 'Switch',              dpt: 'DPST-1-001', t: 'ctrl', mid: 0, midName: 'SW'    },
    { n: 'FB',     full: 'Switch feedback',     dpt: 'DPST-1-001', t: 'fb',   mid: 1, midName: 'FB'    },
    { n: 'DIM',    full: 'Dimming step',        dpt: 'DPST-3-007', t: 'ctrl', mid: 2, midName: 'DIM'   },
    { n: 'VAL',    full: 'Brightness value',    dpt: 'DPST-5-001', t: 'ctrl', mid: 3, midName: 'VAL'   },
    { n: 'VALFB',  full: 'Brightness feedback', dpt: 'DPST-5-001', t: 'fb',   mid: 4, midName: 'VALFB' },
    { n: 'CCT',    full: 'Colour temperature',  dpt: 'DPST-9-001', t: 'ctrl', mid: 5, midName: 'CCT'   },
    { n: 'CCT_FB', full: 'CCT feedback',        dpt: 'DPST-9-001', t: 'fb',   mid: 5, midName: 'CCT'   }
  ],
  lt_rgb: [
    { n: 'SW',     full: 'Switch',              dpt: 'DPST-1-001',   t: 'ctrl', mid: 0, midName: 'SW'    },
    { n: 'FB',     full: 'Switch feedback',     dpt: 'DPST-1-001',   t: 'fb',   mid: 1, midName: 'FB'    },
    { n: 'DIM',    full: 'Dimming step',        dpt: 'DPST-3-007',   t: 'ctrl', mid: 2, midName: 'DIM'   },
    { n: 'VAL',    full: 'Brightness value',    dpt: 'DPST-5-001',   t: 'ctrl', mid: 3, midName: 'VAL'   },
    { n: 'VALFB',  full: 'Brightness feedback', dpt: 'DPST-5-001',   t: 'fb',   mid: 4, midName: 'VALFB' },
    { n: 'RGB',    full: 'RGBW colour',         dpt: 'DPST-232-600', t: 'ctrl', mid: 6, midName: 'RGB'   },
    { n: 'RGB_FB', full: 'RGBW feedback',       dpt: 'DPST-232-600', t: 'fb',   mid: 6, midName: 'RGB'   }
  ],
  pres_sensor: [
    { n: 'STATUS', full: 'Occupancy status', dpt: 'DPST-1-001', t: 'fb',   mid: 0, midName: 'Status' },
    { n: 'LOCK',   full: 'Sensor lock',      dpt: 'DPST-1-001', t: 'ctrl', mid: 1, midName: 'Lock'   },
    { n: 'LUX',    full: 'Brightness lux',   dpt: 'DPST-9-004', t: 'fb',   mid: 2, midName: 'Lux'    }
  ],
  sht_motor: [
    { n: 'MOVE',    full: 'Up/Down',           dpt: 'DPST-1-008', t: 'ctrl', mid: 0, midName: 'Move'    },
    { n: 'STEP',    full: 'Step/Stop',         dpt: 'DPST-1-007', t: 'ctrl', mid: 1, midName: 'Step'    },
    { n: 'POS',     full: 'Position',          dpt: 'DPST-5-001', t: 'ctrl', mid: 2, midName: 'Pos'     },
    { n: 'POS_FB',  full: 'Position feedback', dpt: 'DPST-5-001', t: 'fb',   mid: 3, midName: 'PosFb'   },
    { n: 'TILT',    full: 'Slat angle',        dpt: 'DPST-5-001', t: 'ctrl', mid: 4, midName: 'Tilt'    },
    { n: 'TILT_FB', full: 'Slat feedback',     dpt: 'DPST-5-001', t: 'fb',   mid: 5, midName: 'TiltFb'  }
  ],
  hvac_unit: [
    { n: 'ENABLE',      full: 'On/Off',             dpt: 'DPST-1-001',  t: 'ctrl', mid: 0, midName: 'Enable'     },
    { n: 'SETP',        full: 'Setpoint',           dpt: 'DPST-9-001',  t: 'ctrl', mid: 1, midName: 'Setp'       },
    { n: 'MODE',        full: 'HVAC mode',          dpt: 'DPST-20-102', t: 'ctrl', mid: 2, midName: 'Mode'       },
    { n: 'FAN',         full: 'Fan speed',          dpt: 'DPST-5-001',  t: 'ctrl', mid: 3, midName: 'Fan'        },
    { n: 'SETP_OFFSET', full: 'Setpoint offset',    dpt: 'DPST-9-002',  t: 'ctrl', mid: 4, midName: 'SeptOffset' },
    { n: 'VALVE_CMD',   full: 'Valve command',      dpt: 'DPST-5-001',  t: 'ctrl', mid: 5, midName: 'ValveCmd'   },
    { n: 'SWING',       full: 'Swing / louver',     dpt: 'DPST-5-010',  t: 'ctrl', mid: 6, midName: 'Swing'      },
    { n: 'LOCK',        full: 'Remote lock',        dpt: 'DPST-1-001',  t: 'ctrl', mid: 7, midName: 'Lock'       },
    { n: 'TEMP_ACT',    full: 'Actual temperature', dpt: 'DPST-9-001',  t: 'fb',   mid: 0, midName: 'TempAct'    },
    { n: 'SETP_FB',     full: 'Setpoint feedback',  dpt: 'DPST-9-001',  t: 'fb',   mid: 1, midName: 'SeptFb'     },
    { n: 'MODE_FB',     full: 'Mode feedback',      dpt: 'DPST-20-102', t: 'fb',   mid: 2, midName: 'ModeFb'     },
    { n: 'FAN_FB',      full: 'Fan feedback',       dpt: 'DPST-5-001',  t: 'fb',   mid: 3, midName: 'FanFb'      },
    { n: 'VALVE_FB',    full: 'Valve feedback',     dpt: 'DPST-5-001',  t: 'fb',   mid: 4, midName: 'ValveFb'    },
    { n: 'HUMIDITY',    full: 'Humidity',           dpt: 'DPST-9-007',  t: 'fb',   mid: 5, midName: 'Humidity'   },
    { n: 'ENABLE_FB',   full: 'On/Off feedback',    dpt: 'DPST-1-001',  t: 'fb',   mid: 7, midName: 'EnableFb'   }
  ],
  sec_zone: [
    { n: 'ARM_AWAY',  full: 'Arm away',     dpt: 'DPST-1-001', t: 'ctrl' },
    { n: 'ARM_HOME',  full: 'Arm home',     dpt: 'DPST-1-001', t: 'ctrl' },
    { n: 'DISARM',    full: 'Disarm',       dpt: 'DPST-1-001', t: 'ctrl' },
    { n: 'STATUS_FB', full: 'Arm status',   dpt: 'DPST-1-001', t: 'fb'   },
    { n: 'FIRE',      full: 'Fire alarm',   dpt: 'DPST-1-005', t: 'fb'   },
    { n: 'SIREN',     full: 'Siren',        dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  scn_scene: [
    { n: 'ACTIVATE', full: 'Scene activate', dpt: 'DPST-18-001', t: 'ctrl' },
    { n: 'FB',       full: 'Scene feedback', dpt: 'DPST-18-001', t: 'fb'   }
  ],
  av_unit: [
    { n: 'POWER',  full: 'Power on/off',    dpt: 'DPST-1-001', t: 'ctrl' },
    { n: 'SOURCE', full: 'Source select',   dpt: 'DPST-5-001', t: 'ctrl' },
    { n: 'VOL',    full: 'Volume',          dpt: 'DPST-5-001', t: 'ctrl' },
    { n: 'VOL_FB', full: 'Volume feedback', dpt: 'DPST-5-001', t: 'fb'   },
    { n: 'MUTE',   full: 'Mute',            dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  nrg_meter: [
    { n: 'POWER',   full: 'Active power W', dpt: 'DPST-14-056', t: 'fb' },
    { n: 'ENERGY',  full: 'Energy kWh',     dpt: 'DPST-13-010', t: 'fb' },
    { n: 'VOLTAGE', full: 'Voltage V',      dpt: 'DPST-14-027', t: 'fb' },
    { n: 'CURRENT', full: 'Current A',      dpt: 'DPST-14-019', t: 'fb' }
  ],
  sys_unit: [
    { n: 'TIME',      full: 'Current time',   dpt: 'DPST-10-001', t: 'fb'   },
    { n: 'DATE',      full: 'Current date',   dpt: 'DPST-11-001', t: 'fb'   },
    { n: 'OCC_MODE',  full: 'Occupancy mode', dpt: 'DPST-5-001',  t: 'ctrl' },
    { n: 'HEARTBEAT', full: 'Heartbeat',      dpt: 'DPST-1-001',  t: 'fb'   }
  ]
};

// ─── DEFAULT FLOORS ───────────────────────────────────────────────────────────
const defaultFloors = [
  { id: 'f0', mid: 0, name: 'Central / Global', rooms: ['All zones', 'Scenes', 'Security global'], fixed: true },
  { id: 'f1', mid: 1, name: 'Basement',         rooms: ['Garage', 'Storage', 'Utility'] },
  { id: 'f2', mid: 2, name: 'Ground floor',     rooms: ['Living room', 'Dining', 'Kitchen', 'WC', 'Entrance'] },
  { id: 'f3', mid: 3, name: 'Floor 1',          rooms: ['Master bedroom', 'Master bath', 'Bedroom 2', 'Corridor'] },
  { id: 'f4', mid: 4, name: 'Floor 2',          rooms: ['Bedroom 3', 'Bedroom 4', 'Study', 'Bath 2'] },
  { id: 'f5', mid: 5, name: 'Roof / Outdoor',   rooms: ['Terrace', 'Garden', 'Pool area'] }
];

// ─── GENERATE GAs ─────────────────────────────────────────────────────────────
/**
 * @param {object} payload
 * @param {string}  payload.structure   - 'function' | 'building'
 * @param {object}  payload.floors      - floor array [{id, mid, name, rooms[]}]
 * @param {object}  payload.systems     - { lt: true|false, ... }
 * @param {object}  payload.circuits    - [fi][ri][sk][ck] = string[] (circuit names)
 * @param {Array}   payload.manualGAs   - manually added GAs preserved across regenerate
 * @returns {Array} GA[]  { addr, name, dpt, type, main, mid, mainName, _id }
 */
function generateGAs({ structure, floors, systems, circuits = {}, manualGAs = [], ltSubs = {}, hvacSubs = {} }) {
  const gas = [];
  const sysList = Object.keys(systems).filter(k => systems[k]);

  // Build active-sub filters — empty object means "all enabled"
  const ltFilter = Object.keys(ltSubs).length > 0 ? ck => !!ltSubs[ck] : () => true;

  // sub-address counter per "main/mid" key — increments to avoid collisions
  const subCounter = {};
  function nextSub(main, mid) {
    const k = `${main}/${mid}`;
    if (subCounter[k] === undefined) subCounter[k] = 1;
    return subCounter[k];
  }
  function advanceSub(main, mid, count) {
    const k = `${main}/${mid}`;
    subCounter[k] = (subCounter[k] || 0) + count;
  }

  // circuit name lookup — returns array of user-given names
  function getNames(fi, ri, sk, ck) {
    return ((((circuits[fi] || {})[ri] || {})[sk] || {})[ck]) || [];
  }

  sysList.forEach(sk => {
    const si = sysInfo[sk];
    const mainNum = si.main;
    const px = prefix[sk];
    const allDefs = circuitDefs[sk] || [];
    const cdefs = allDefs.filter(([ck]) => {
      if (sk === 'lt') return ltFilter(ck);
      return true;
    });

    // Per floor → per room → per circuit type → per unit quantity
    floors.forEach((floor, fi) => {
      if (floor.mid === 0) return;
      const fp = floor.name;

      floor.rooms.forEach((room, ri) => {
        if (room === 'All zones' || room === 'Scenes') return;

        cdefs.forEach(([ck, clabel]) => {
          const names = getNames(fi, ri, sk, ck);
          if (names.length === 0) return;
          const cset = circuitGaSet[`${sk}_${ck}`] || gasets[sk];
          const circuitLabel = cdefs.length > 1 ? ` - [${clabel}] - ` : ' - ';

          names.forEach((name, ui) => {
            if (si.midScheme === 'gatype') {
              // Middle group encodes GA type; ctrl uses mainNum, fb uses mainFb if defined (e.g. HVAC)
              cset.forEach((ga, gi) => {
                const gaMid  = ga.mid;
                const mainG  = (ga.t === 'fb' && si.mainFb) ? si.mainFb : mainNum;
                const mName  = (ga.t === 'fb' && si.mainFb) ? (si.nameFb_en || si.name_en) : si.name_en;
                const sub    = nextSub(mainG, gaMid);
                gas.push({
                  addr:     `${mainG}/${gaMid}/${sub}`,
                  name:     `${px} - ${fp} - ${room}${circuitLabel}${name} - ${ga.n}`,
                  dpt:      ga.dpt,
                  type:     ga.t,
                  main:     mainG,
                  mid:      gaMid,
                  midName:  ga.midName,
                  mainName: mName,
                  room:     room,
                  _id:      `${sk}_${fi}_${ri}_${ck}_${ui}_${gi}`
                });
                advanceSub(mainG, gaMid, 1);
              });
            } else if (si.mainFb) {
              // Systems with separate ctrl / fb main groups (e.g. HVAC: ctrl=4, fb=5)
              const ctrlSet = cset.filter(ga => ga.t === 'ctrl');
              const fbSet   = cset.filter(ga => ga.t === 'fb');
              const ctrlSub = nextSub(mainNum, floor.mid);
              ctrlSet.forEach((ga, gi) => {
                gas.push({
                  addr:     `${mainNum}/${floor.mid}/${ctrlSub + gi}`,
                  name:     `${px} - ${fp} - ${room}${circuitLabel}${name} - ${ga.n}`,
                  dpt:      ga.dpt,
                  type:     ga.t,
                  main:     mainNum,
                  mid:      floor.mid,
                  mainName: si.name_en,
                  room:     room,
                  _id:      `${sk}_${fi}_${ri}_${ck}_${ui}_c${gi}`
                });
              });
              advanceSub(mainNum, floor.mid, ctrlSet.length);
              const fbSub = nextSub(si.mainFb, floor.mid);
              fbSet.forEach((ga, gi) => {
                gas.push({
                  addr:     `${si.mainFb}/${floor.mid}/${fbSub + gi}`,
                  name:     `${px} - ${fp} - ${room}${circuitLabel}${name} - ${ga.n}`,
                  dpt:      ga.dpt,
                  type:     ga.t,
                  main:     si.mainFb,
                  mid:      floor.mid,
                  mainName: si['nameFb_en'] || (si.name_en + ' FB'),
                  room:     room,
                  _id:      `${sk}_${fi}_${ri}_${ck}_${ui}_f${gi}`
                });
              });
              advanceSub(si.mainFb, floor.mid, fbSet.length);
            } else {
              const sub = nextSub(mainNum, floor.mid);
              cset.forEach((ga, gi) => {
                gas.push({
                  addr:     `${mainNum}/${floor.mid}/${sub + gi}`,
                  name:     `${px} - ${fp} - ${room}${circuitLabel}${name} - ${ga.n}`,
                  dpt:      ga.dpt,
                  type:     ga.t,
                  main:     mainNum,
                  mid:      floor.mid,
                  mainName: si.name_en,
                  room:     room,
                  _id:      `${sk}_${fi}_${ri}_${ck}_${ui}_${gi}`
                });
              });
              advanceSub(mainNum, floor.mid, cset.length);
            }
          });
        });
      });
    });
  });

  // Merge manualGAs — skip if address already generated
  manualGAs.forEach(mg => {
    if (!gas.find(g => g.addr === mg.addr)) gas.push(mg);
  });

  // Sort by main → mid → sub (numeric)
  gas.sort((a, b) => {
    const ap = a.addr.split('/').map(Number);
    const bp = b.addr.split('/').map(Number);
    for (let i = 0; i < 3; i++) {
      if (ap[i] !== bp[i]) return ap[i] - bp[i];
    }
    return 0;
  });

  return gas;
}

// ─── PARSE XML ────────────────────────────────────────────────────────────────
/**
 * Parse ETS GroupAddress-Export XML — regex only, no DOMParser (Node.js safe)
 * @param {string} xmlString
 * @returns {Array} GA[]  { addr, name, dpt, type, main, mid, mainName }
 */
function parseXML(xmlString) {
  const gas = [];
  const gaRegex = /<GroupAddress\s([^>]*?)\/>/g;
  const attrRegex = /(\w+)="([^"]*)"/g;

  let gaMatch;
  while ((gaMatch = gaRegex.exec(xmlString)) !== null) {
    const attrsStr = gaMatch[1];
    const attrs = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    const addr = attrs.Address || attrs.address || '';
    const name = attrs.Name    || attrs.name    || '';
    if (!addr || !name) continue;

    const parts = addr.split('/').map(Number);
    gas.push({
      addr,
      name,
      dpt:      attrs.DPTs || attrs.dpt || 'DPST-1-001',
      type:     'ctrl',
      main:     parts[0] || 0,
      mid:      parts[1] || 0,
      mainName: 'Imported'
    });
  }

  return gas;
}

// ─── BUILD XML ────────────────────────────────────────────────────────────────
/**
 * @param {Array}  gas
 * @param {object} opts
 * @param {string}  opts.projectName
 * @param {Array}   opts.floors       - to lookup floor name from mid
 * @param {boolean} opts.includeDpt
 * @param {boolean} opts.includeDesc
 * @returns {string} ETS-compatible XML string
 */
function buildXML(gas, { projectName = '', floors = [], includeDpt = true, includeDesc = false } = {}) {
  // Group gas into mainGroups[main].mids[mid].gas[]
  const mainGroups = {};
  gas.forEach(g => {
    if (!mainGroups[g.main]) {
      mainGroups[g.main] = { name: g.mainName, mids: {} };
    }
    if (!mainGroups[g.main].mids[g.mid]) {
      const floor = floors.find(f => f.mid === g.mid);
      mainGroups[g.main].mids[g.mid] = { name: g.midName || (floor ? floor.name : 'Zone'), gas: [] };
    }
    mainGroups[g.main].mids[g.mid].gas.push(g);
  });

  const lines = [
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
    '<GroupAddress-Export xmlns="http://knx.org/xml/ga-export/01">'
  ];

  Object.entries(mainGroups).forEach(([mn, mg]) => {
    const rangeStart = parseInt(mn) * 2048;
    const rangeEnd   = rangeStart + 2047;
    lines.push('');
    lines.push(`  <!-- Main group ${mn}: ${mg.name} -->`);
    lines.push(`  <GroupRange Name="${mn} ${mg.name}" RangeStart="${rangeStart}" RangeEnd="${rangeEnd}">`);

    Object.entries(mg.mids).forEach(([mid, mm]) => {
      const mStart = rangeStart + parseInt(mid) * 256;
      const mEnd   = mStart + 255;
      lines.push(`    <GroupRange Name="${mn}/${mid} ${mm.name}" RangeStart="${mStart}" RangeEnd="${mEnd}">`);

      mm.gas.forEach(g => {
        const dptAttr  = includeDpt  ? ` DPTs="${g.dpt}"` : '';
        const descAttr = includeDesc ? ` Description="${g.type === 'ctrl' ? 'Control' : 'Feedback'}"` : '';
        lines.push(`      <GroupAddress Name="${g.name}" Address="${g.addr}"${dptAttr}${descAttr} />`);
      });

      lines.push('    </GroupRange>');
    });

    lines.push('  </GroupRange>');
  });

  lines.push('</GroupAddress-Export>');
  return lines.join('\n');
}

// ─── BUILD CSV ────────────────────────────────────────────────────────────────
/**
 * ETS-compatible hierarchical CSV (tab-delimited, 4 columns)
 * Columns: Main group | Middle group | Group address | Address
 * @param {Array}  gas
 * @param {object} opts
 * @param {Array}   opts.floors  - to lookup floor name from mid
 * @returns {string} tab-delimited CSV string
 */
function buildCSV(gas, { floors = [] } = {}) {
  const mainGroups = {};
  gas.forEach(g => {
    if (!mainGroups[g.main]) {
      mainGroups[g.main] = { name: g.mainName, mids: {} };
    }
    if (!mainGroups[g.main].mids[g.mid]) {
      const floor = floors.find(f => f.mid === g.mid);
      mainGroups[g.main].mids[g.mid] = { name: g.midName || (floor ? floor.name : 'Zone'), gas: [] };
    }
    mainGroups[g.main].mids[g.mid].gas.push(g);
  });

  const lines = [['Main group', 'Middle group', 'Group address', 'Address'].join('\t')];

  Object.entries(mainGroups).forEach(([mn, mg]) => {
    lines.push([`${mn} ${mg.name}`, '', '', `${mn}/-/-`].join('\t'));

    Object.entries(mg.mids).forEach(([mid, mm]) => {
      lines.push(['', `${mn}/${mid} ${mm.name}`, '', `${mn}/${mid}/-`].join('\t'));
      mm.gas.forEach(g => {
        lines.push(['', '', g.name, g.addr].join('\t'));
      });
    });
  });

  return lines.join('\n');
}

// ─── EXPORTS (Node.js only — not used in browser) ─────────────────────────────
// ─── RECONSTRUCT FROM XML ─────────────────────────────────────────────────────
/**
 * Full state reconstruction from an ETS XML export.
 * Parses GroupRange elements for floor names, then derives floors, rooms,
 * circuits, and active systems so every wizard step is pre-populated.
 *
 * GA name format produced by this tool:
 *   With bracket  : "PREFIX - FP - ROOM - [TYPE] - NAME - GA_SHORT"   (lt when >1 type)
 *   Without bracket: "PREFIX - FP - ROOM - NAME - GA_SHORT"            (all single-type systems)
 *
 * @param {string} xmlString
 * @returns {{ floors, circuits, systems, ltSubs, hvacSubs }}
 */
function reconstructFromXML(xmlString) {
  // 0. Identify gatype main groups (mid encodes GA type, not floor)
  const gatypeMains = new Set();
  Object.values(sysInfo).forEach(si => { if (si.midScheme === 'gatype') gatypeMains.add(si.main); });

  // 1. Parse floor names from middle-level GroupRange elements (skip gatype mains)
  //    e.g. <GroupRange Name="3/1 Tầng 1" ...>  → mid=1, name="Tầng 1"
  const floorNames = {};
  const grRegex = /<GroupRange\s[^>]*?Name="([^"]*)"/g;
  let grM;
  while ((grM = grRegex.exec(xmlString)) !== null) {
    const midM = grM[1].match(/^(\d+)\/(\d+)\s+(.*)/);
    if (midM) {
      const mainG = parseInt(midM[1]);
      if (gatypeMains.has(mainG)) continue; // LT uses gatype: "1/0 SW" is not a floor name
      const mid = parseInt(midM[2]);
      const fname = midM[3].trim();
      if (mid > 0 && fname) floorNames[mid] = fname;
    }
  }

  // 2. Parse all GAs
  const gas = parseXML(xmlString);
  if (!gas.length) return { floors: [], circuits: {}, systems: {}, ltSubs: {} };

  // 3. Helpers
  const prefixToSk = {};
  Object.entries(prefix).forEach(([sk, px]) => { prefixToSk[px] = sk; });

  const labelToCk = {}; // sk → typeLabel → ck
  Object.entries(circuitDefs).forEach(([sk, defs]) => {
    labelToCk[sk] = {};
    defs.forEach(([ck, label]) => { labelToCk[sk][label] = ck; });
  });

  // Reverse map: floor name → mid (from non-gatype GroupRanges)
  const floorNameToMid = {};
  Object.entries(floorNames).forEach(([mid, name]) => { floorNameToMid[name] = parseInt(mid); });

  // For gatype-only projects: auto-assign mids by first appearance
  const gatypeFloorMids = {}; // floorName → assigned mid
  let nextAutoMid = 1;

  // 4. Build unique circuit signatures per floorMid
  //    Signature = GA name without trailing " - GA_SHORT"
  const sigMap = {}; // floorMid → { sig → { sk, room, parts } }
  const systems = Object.fromEntries(Object.keys(sysInfo).map(k => [k, false]));

  gas.forEach(g => {
    const parts = g.name.split(' - ');
    if (parts.length < 5) return; // min: PREFIX - FP - ROOM - NAME - GA_SHORT
    const sk = prefixToSk[parts[0].trim()];
    if (!sk) return;
    systems[sk] = true;

    const si = sysInfo[sk];
    let floorMid;

    if (si.midScheme === 'gatype') {
      // For gatype systems (LT), mid in address = GA type; floor name is in parts[1]
      const fpName = parts[1].trim();
      if (floorNameToMid[fpName] !== undefined) {
        floorMid = floorNameToMid[fpName];
      } else if (gatypeFloorMids[fpName] !== undefined) {
        floorMid = gatypeFloorMids[fpName];
      } else {
        // Assign next available mid not already used
        while (floorNames[nextAutoMid] !== undefined || Object.values(gatypeFloorMids).includes(nextAutoMid)) {
          nextAutoMid++;
        }
        gatypeFloorMids[fpName] = nextAutoMid;
        floorMid = nextAutoMid;
        nextAutoMid++;
      }
    } else {
      if (g.mid === 0) return;
      floorMid = g.mid;
    }

    const sig = parts.slice(0, -1).join(' - ');
    const room = parts[2].trim();
    if (!sigMap[floorMid]) sigMap[floorMid] = {};
    if (!sigMap[floorMid][sig]) sigMap[floorMid][sig] = { sk, room, parts };
  });

  // 5. First pass: collect rooms from all signatures (room is always parts[2])
  const midRooms = {}; // floorMid → string[] unique ordered
  Object.entries(sigMap).forEach(([midStr, sigs]) => {
    const mid = parseInt(midStr);
    midRooms[mid] = [];
    Object.values(sigs).forEach(({ room }) => {
      if (room && !midRooms[mid].includes(room)) midRooms[mid].push(room);
    });
  });

  // 6. Build floors array
  const floorMap = {};
  Object.entries(midRooms).forEach(([midStr, rooms]) => {
    const mid = parseInt(midStr);
    let fname = floorNames[mid];
    if (!fname) {
      const entry = Object.entries(gatypeFloorMids).find(([, m]) => m === mid);
      if (entry) fname = entry[0];
    }
    floorMap[mid] = { id: 'f' + mid, mid, name: fname || floorPrefix[mid] || ('Floor ' + mid), rooms: [...rooms] };
  });
  // Cover floors appearing in non-gatype GAs but with no extractable rooms
  gas.forEach(g => {
    const parts = g.name.split(' - ');
    const sk = prefixToSk[(parts[0] || '').trim()];
    if (!sk) return;
    const si = sysInfo[sk];
    if (si.midScheme === 'gatype' || g.mid === 0 || floorMap[g.mid]) return;
    floorMap[g.mid] = { id: 'f' + g.mid, mid: g.mid, name: floorNames[g.mid] || floorPrefix[g.mid] || ('Floor ' + g.mid), rooms: [] };
  });
  const floors = Object.values(floorMap).sort((a, b) => a.mid - b.mid);

  // 7. Index maps
  const midToFi = {};
  floors.forEach((f, fi) => { midToFi[f.mid] = fi; });
  const roomIdx = {};
  floors.forEach((f, fi) => { roomIdx[fi] = {}; f.rooms.forEach((r, ri) => { roomIdx[fi][r] = ri; }); });

  // 8. Second pass: build circuits + detect lt subtypes
  const circuits = {};
  const ltSubsFound = {};

  Object.entries(sigMap).forEach(([midStr, sigs]) => {
    const mid = parseInt(midStr);
    const fi = midToFi[mid];
    if (fi === undefined) return;

    Object.values(sigs).forEach(({ sk, room, parts }) => {
      let ck, circuitName;
      const typeOrName = parts[3].trim(); // parts[3] = "[TYPE]" or circuit name

      if (typeOrName.startsWith('[') && typeOrName.endsWith(']')) {
        // Bracket format: PREFIX - FP - ROOM - [TYPE] - NAME - GA_SHORT
        const typeLabel = typeOrName.slice(1, -1);
        circuitName = parts[4] ? parts[4].trim() : '';
        ck = (labelToCk[sk] || {})[typeLabel] || ((circuitDefs[sk] || [[]])[0] || [])[0];
        if (sk === 'lt' && ck) ltSubsFound[ck] = true;
      } else {
        // No-bracket format: PREFIX - FP - ROOM - NAME - GA_SHORT
        circuitName = typeOrName;
        ck = ((circuitDefs[sk] || [[]])[0] || [])[0];
      }

      if (!room || !ck || !circuitName) return;
      const ri = (roomIdx[fi] || {})[room];
      if (ri === undefined) return;

      if (!circuits[fi])             circuits[fi] = {};
      if (!circuits[fi][ri])         circuits[fi][ri] = {};
      if (!circuits[fi][ri][sk])     circuits[fi][ri][sk] = {};
      if (!circuits[fi][ri][sk][ck]) circuits[fi][ri][sk][ck] = [];
      const arr = circuits[fi][ri][sk][ck];
      if (!arr.includes(circuitName)) arr.push(circuitName);
    });
  });

  // 9. Build ltSubs from found circuit types
  const ltSubs = { onoff: false, dim: false, cct: false, rgb: false };
  Object.keys(ltSubsFound).forEach(k => { if (k in ltSubs) ltSubs[k] = true; });

  return { floors, circuits, systems, ltSubs };
}

if (typeof module !== 'undefined') module.exports = {
  ALLOWED_ORIGINS,
  sysInfo,
  prefix,
  floorPrefix,
  gasets,
  circuitDefs,
  circuitGaSet,
  defaultFloors,
  generateGAs,
  parseXML,
  reconstructFromXML,
  buildXML,
  buildCSV
};

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
  av:   { name_en: 'Audio Visual',  name_vi: 'Nghe nhìn',           desc_en: 'TV/amp power, source, volume and mute.',          desc_vi: 'Nguồn TV/amp, chọn đầu vào, âm lượng, tắt tiếng.',  main: 7, midScheme: 'gatype', icon: 'av',    gaNames: ['POWER','SOURCE','VOL','VOL_FB','MUTE'] },
  nrg:  { name_en: 'Energy',        name_vi: 'Giám sát điện',       desc_en: 'Power, energy, voltage and current per circuit.', desc_vi: 'Công suất, điện năng, điện áp, dòng điện.',         main: 8, midScheme: 'gatype', icon: 'nrg',   gaNames: ['POWER','ENERGY','VOLTAGE','CURRENT','POWER_FACTOR'] },
  sys:  { name_en: 'System logic',  name_vi: 'Logic hệ thống',      desc_en: 'Time, date, sunrise/sunset and occupancy mode.',  desc_vi: 'Thời gian, ngày tháng, mặt trời và chế độ.',        main: 9, midScheme: 'gatype', global: true, icon: 'sys',   gaNames: ['TIME','DATE','SUNRISE','SUNSET','OCC_MODE','NIGHT_MODE','GUEST_MODE','HEARTBEAT','BUS_VOLTAGE'] }
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
    { o: '+5', n: 'CCT',    full: 'Colour temperature',  dpt: 'DPST-5-001',   t: 'ctrl' },
    { o: '+6', n: 'CCT_FB', full: 'Colour temp FB',      dpt: 'DPST-5-001',   t: 'fb'   },
    { o: '+7', n: 'RGB',    full: 'RGBW colour',         dpt: 'DPST-232-600', t: 'ctrl' },
    { o: '+8', n: 'RGB_FB', full: 'RGBW feedback',       dpt: 'DPST-232-600', t: 'fb'   }
  ],
  pres: [
    { o: '+0', n: 'STATUS', full: 'Occupancy status', dpt: 'DPST-1-018', t: 'fb'   },
    { o: '+1', n: 'LUX',    full: 'Brightness lux',   dpt: 'DPST-9-004', t: 'fb'   },
    { o: '+2', n: 'LOCK',   full: 'Sensor lock',      dpt: 'DPST-1-003', t: 'ctrl' }
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
    { o:  '+6', n: 'SWING',       full: 'Swing / louver',        dpt: 'DPST-5-001',  t: 'ctrl' },
    { o:  '+7', n: 'LOCK',        full: 'Remote lock',           dpt: 'DPST-1-003',  t: 'ctrl' },
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
    { o: '+1', n: 'SOURCE', full: 'Source select',   dpt: 'DPST-5-010', t: 'ctrl' },
    { o: '+2', n: 'VOL',    full: 'Volume 0–255',    dpt: 'DPST-5-001', t: 'ctrl' },
    { o: '+3', n: 'VOL_FB', full: 'Volume feedback', dpt: 'DPST-5-001', t: 'fb'   },
    { o: '+4', n: 'MUTE',   full: 'Mute toggle',     dpt: 'DPST-1-001', t: 'ctrl' }
  ],
  nrg: [
    { o: '+0', n: 'POWER',   full: 'Active power W',   dpt: 'DPST-14-056', t: 'fb' },
    { o: '+1', n: 'ENERGY',  full: 'Energy kWh',       dpt: 'DPST-13-013', t: 'fb' },
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

// ─── DPT OPTIONS (curated list for manual GA form) ────────────────────────────
const dptOptions = [
  { id: 'DPST-1-001', name: 'DPT_Switch' },
  { id: 'DPST-1-002', name: 'DPT_Bool' },
  { id: 'DPST-1-003', name: 'DPT_Enable' },
  { id: 'DPST-1-004', name: 'DPT_Ramp' },
  { id: 'DPST-1-005', name: 'DPT_Alarm' },
  { id: 'DPST-1-006', name: 'DPT_BinaryValue' },
  { id: 'DPST-1-007', name: 'DPT_Step' },
  { id: 'DPST-1-008', name: 'DPT_UpDown' },
  { id: 'DPST-1-009', name: 'DPT_OpenClose' },
  { id: 'DPST-1-010', name: 'DPT_Start' },
  { id: 'DPST-1-011', name: 'DPT_State' },
  { id: 'DPST-1-012', name: 'DPT_Invert' },
  { id: 'DPST-1-013', name: 'DPT_DimSendStyle' },
  { id: 'DPST-1-014', name: 'DPT_InputSource' },
  { id: 'DPST-1-015', name: 'DPT_Reset' },
  { id: 'DPST-1-016', name: 'DPT_Ack' },
  { id: 'DPST-1-017', name: 'DPT_Trigger' },
  { id: 'DPST-1-018', name: 'DPT_Occupancy' },
  { id: 'DPST-1-019', name: 'DPT_Window_Door' },
  { id: 'DPST-1-021', name: 'DPT_LogicalFunction' },
  { id: 'DPST-1-022', name: 'DPT_Scene_AB' },
  { id: 'DPST-1-023', name: 'DPT_ShutterBlinds_Mode' },
  { id: 'DPST-1-100', name: 'DPT_Heat/Cool' },
  { id: 'DPST-2-001', name: 'DPT_Switch_Control' },
  { id: 'DPST-2-002', name: 'DPT_Bool_Control' },
  { id: 'DPST-2-003', name: 'DPT_Enable_Control' },
  { id: 'DPST-2-004', name: 'DPT_Ramp_Control' },
  { id: 'DPST-2-005', name: 'DPT_Alarm_Control' },
  { id: 'DPST-2-006', name: 'DPT_BinaryValue_Control' },
  { id: 'DPST-2-007', name: 'DPT_Step_Control' },
  { id: 'DPST-2-008', name: 'DPT_Direction1_Control' },
  { id: 'DPST-2-009', name: 'DPT_Direction2_Control' },
  { id: 'DPST-2-010', name: 'DPT_Start_Control' },
  { id: 'DPST-2-011', name: 'DPT_State_Control' },
  { id: 'DPST-2-012', name: 'DPT_Invert_Control' },
  { id: 'DPST-3-007', name: 'DPT_Control_Dimming' },
  { id: 'DPST-3-008', name: 'DPT_Control_Blinds' },
  { id: 'DPST-4-001', name: 'DPT_Char_ASCII' },
  { id: 'DPST-4-002', name: 'DPT_Char_8859_1' },
  { id: 'DPST-5-001', name: 'DPT_Scaling' },
  { id: 'DPST-5-003', name: 'DPT_Angle' },
  { id: 'DPST-5-004', name: 'DPT_Percent_U8' },
  { id: 'DPST-5-005', name: 'DPT_DecimalFactor' },
  { id: 'DPST-5-006', name: 'DPT_Tariff' },
  { id: 'DPST-5-010', name: 'DPT_Value_1_Ucount' },
  { id: 'DPST-6-001', name: 'DPT_Percent_V8' },
  { id: 'DPST-6-010', name: 'DPT_Value_1_Count' },
  { id: 'DPST-6-020', name: 'DPT_Status_Mode3' },
  { id: 'DPST-7-001', name: 'DPT_Value_2_Ucount' },
  { id: 'DPST-7-002', name: 'DPT_TimePeriodMsec' },
  { id: 'DPST-7-003', name: 'DPT_TimePeriod10Msec' },
  { id: 'DPST-7-004', name: 'DPT_TimePeriod100Msec' },
  { id: 'DPST-7-005', name: 'DPT_TimePeriodSec' },
  { id: 'DPST-7-006', name: 'DPT_TimePeriodMin' },
  { id: 'DPST-7-007', name: 'DPT_TimePeriodHrs' },
  { id: 'DPST-7-010', name: 'DPT_PropDataType' },
  { id: 'DPST-7-011', name: 'DPT_Length_mm' },
  { id: 'DPST-7-012', name: 'DPT_UElCurrentmA' },
  { id: 'DPST-7-013', name: 'DPT_Brightness' },
  { id: 'DPST-8-001', name: 'DPT_Value_2_Count' },
  { id: 'DPST-8-002', name: 'DPT_DeltaTimeMsec' },
  { id: 'DPST-8-003', name: 'DPT_DeltaTime10Msec' },
  { id: 'DPST-8-004', name: 'DPT_DeltaTime100Msec' },
  { id: 'DPST-8-005', name: 'DPT_DeltaTimeSec' },
  { id: 'DPST-8-006', name: 'DPT_DeltaTimeMin' },
  { id: 'DPST-8-007', name: 'DPT_DeltaTimeHrs' },
  { id: 'DPST-8-010', name: 'DPT_Percent_V16' },
  { id: 'DPST-8-011', name: 'DPT_Rotation_Angle' },
  { id: 'DPST-9-001', name: 'DPT_Value_Temp' },
  { id: 'DPST-9-002', name: 'DPT_Value_Tempd' },
  { id: 'DPST-9-003', name: 'DPT_Value_Tempa' },
  { id: 'DPST-9-004', name: 'DPT_Value_Lux' },
  { id: 'DPST-9-005', name: 'DPT_Value_Wsp' },
  { id: 'DPST-9-006', name: 'DPT_Value_Pres' },
  { id: 'DPST-9-007', name: 'DPT_Value_Humidity' },
  { id: 'DPST-9-008', name: 'DPT_Value_AirQuality' },
  { id: 'DPST-9-010', name: 'DPT_Value_Time1' },
  { id: 'DPST-9-011', name: 'DPT_Value_Time2' },
  { id: 'DPST-9-020', name: 'DPT_Value_Volt' },
  { id: 'DPST-9-021', name: 'DPT_Value_Curr' },
  { id: 'DPST-9-022', name: 'DPT_PowerDensity' },
  { id: 'DPST-9-023', name: 'DPT_KelvinPerPercent' },
  { id: 'DPST-9-024', name: 'DPT_Power' },
  { id: 'DPST-9-025', name: 'DPT_Value_Volume_Flow' },
  { id: 'DPST-9-026', name: 'DPT_Rain_Amount' },
  { id: 'DPST-9-027', name: 'DPT_Value_Temp_F' },
  { id: 'DPST-9-028', name: 'DPT_Value_Wsp_kmh' },
  { id: 'DPST-10-001', name: 'DPT_TimeOfDay' },
  { id: 'DPST-11-001', name: 'DPT_Date' },
  { id: 'DPST-12-001', name: 'DPT_Value_4_Ucount' },
  { id: 'DPST-13-001', name: 'DPT_Value_4_Count' },
  { id: 'DPST-13-002', name: 'DPT_FlowRate_m3/h' },
  { id: 'DPST-13-010', name: 'DPT_ActiveEnergy' },
  { id: 'DPST-13-012', name: 'DPT_ReactiveEnergy' },
  { id: 'DPST-13-013', name: 'DPT_ActiveEnergy_kWh' },
  { id: 'DPST-13-014', name: 'DPT_ApparantEnergy_kVAh' },
  { id: 'DPST-13-015', name: 'DPT_ReactiveEnergy_kVARh' },
  { id: 'DPST-13-100', name: 'DPT_LongDeltaTimeSec' },
  { id: 'DPST-14-000', name: 'DPT_Value_Acceleration' },
  { id: 'DPST-14-001', name: 'DPT_Value_Acceleration_Angular' },
  { id: 'DPST-14-002', name: 'DPT_Value_Activation_Energy' },
  { id: 'DPST-14-003', name: 'DPT_Value_Activity' },
  { id: 'DPST-14-004', name: 'DPT_Value_Mol' },
  { id: 'DPST-14-005', name: 'DPT_Value_Amplitude' },
  { id: 'DPST-14-006', name: 'DPT_Value_AngleRad' },
  { id: 'DPST-14-007', name: 'DPT_Value_AngleDeg' },
  { id: 'DPST-14-008', name: 'DPT_Value_Angular_Momentum' },
  { id: 'DPST-14-009', name: 'DPT_Value_Angular_Velocity' },
  { id: 'DPST-14-010', name: 'DPT_Value_Area' },
  { id: 'DPST-14-011', name: 'DPT_Value_Capacitance' },
  { id: 'DPST-14-012', name: 'DPT_Value_Charge_DensitySurface' },
  { id: 'DPST-14-013', name: 'DPT_Value_Charge_DensityVolume' },
  { id: 'DPST-14-014', name: 'DPT_Value_Compressibility' },
  { id: 'DPST-14-015', name: 'DPT_Value_Conductance' },
  { id: 'DPST-14-016', name: 'DPT_Value_Electrical_Conductivity' },
  { id: 'DPST-14-017', name: 'DPT_Value_Density' },
  { id: 'DPST-14-018', name: 'DPT_Value_Electric_Charge' },
  { id: 'DPST-14-019', name: 'DPT_Value_Electric_Current' },
  { id: 'DPST-14-020', name: 'DPT_Value_Electric_CurrentDensity' },
  { id: 'DPST-14-021', name: 'DPT_Value_Electric_DipoleMoment' },
  { id: 'DPST-14-022', name: 'DPT_Value_Electric_Displacement' },
  { id: 'DPST-14-023', name: 'DPT_Value_Electric_FieldStrength' },
  { id: 'DPST-14-024', name: 'DPT_Value_Electric_Flux' },
  { id: 'DPST-14-025', name: 'DPT_Value_Electric_FluxDensity' },
  { id: 'DPST-14-026', name: 'DPT_Value_Electric_Polarization' },
  { id: 'DPST-14-027', name: 'DPT_Value_Electric_Potential' },
  { id: 'DPST-14-028', name: 'DPT_Value_Electric_PotentialDifference' },
  { id: 'DPST-14-029', name: 'DPT_Value_ElectromagneticMoment' },
  { id: 'DPST-14-030', name: 'DPT_Value_Electromotive_Force' },
  { id: 'DPST-14-031', name: 'DPT_Value_Energy' },
  { id: 'DPST-14-032', name: 'DPT_Value_Force' },
  { id: 'DPST-14-033', name: 'DPT_Value_Frequency' },
  { id: 'DPST-14-034', name: 'DPT_Value_Angular_Frequency' },
  { id: 'DPST-14-035', name: 'DPT_Value_Heat_Capacity' },
  { id: 'DPST-14-036', name: 'DPT_Value_Heat_FlowRate' },
  { id: 'DPST-14-037', name: 'DPT_Value_Heat_Quantity' },
  { id: 'DPST-14-038', name: 'DPT_Value_Impedance' },
  { id: 'DPST-14-039', name: 'DPT_Value_Length' },
  { id: 'DPST-14-040', name: 'DPT_Value_Light_Quantity' },
  { id: 'DPST-14-041', name: 'DPT_Value_Luminance' },
  { id: 'DPST-14-042', name: 'DPT_Value_Luminous_Flux' },
  { id: 'DPST-14-043', name: 'DPT_Value_Luminous_Intensity' },
  { id: 'DPST-14-044', name: 'DPT_Value_Magnetic_FieldStrength' },
  { id: 'DPST-14-045', name: 'DPT_Value_Magnetic_Flux' },
  { id: 'DPST-14-046', name: 'DPT_Value_Magnetic_FluxDensity' },
  { id: 'DPST-14-047', name: 'DPT_Value_Magnetic_Moment' },
  { id: 'DPST-14-048', name: 'DPT_Value_Magnetic_Polarization' },
  { id: 'DPST-14-049', name: 'DPT_Value_Magnetization' },
  { id: 'DPST-14-050', name: 'DPT_Value_MagnetomotiveForce' },
  { id: 'DPST-14-051', name: 'DPT_Value_Mass' },
  { id: 'DPST-14-052', name: 'DPT_Value_MassFlux' },
  { id: 'DPST-14-053', name: 'DPT_Value_Momentum' },
  { id: 'DPST-14-054', name: 'DPT_Value_Phase_AngleRad' },
  { id: 'DPST-14-055', name: 'DPT_Value_Phase_AngleDeg' },
  { id: 'DPST-14-056', name: 'DPT_Value_Power' },
  { id: 'DPST-14-057', name: 'DPT_Value_Power_Factor' },
  { id: 'DPST-14-058', name: 'DPT_Value_Pressure' },
  { id: 'DPST-14-059', name: 'DPT_Value_Reactance' },
  { id: 'DPST-14-060', name: 'DPT_Value_Resistance' },
  { id: 'DPST-14-061', name: 'DPT_Value_Resistivity' },
  { id: 'DPST-14-062', name: 'DPT_Value_SelfInductance' },
  { id: 'DPST-14-063', name: 'DPT_Value_SolidAngle' },
  { id: 'DPST-14-064', name: 'DPT_Value_Sound_Intensity' },
  { id: 'DPST-14-065', name: 'DPT_Value_Speed' },
  { id: 'DPST-14-066', name: 'DPT_Value_Stress' },
  { id: 'DPST-14-067', name: 'DPT_Value_Surface_Tension' },
  { id: 'DPST-14-068', name: 'DPT_Value_Common_Temperature' },
  { id: 'DPST-14-069', name: 'DPT_Value_Absolute_Temperature' },
  { id: 'DPST-14-070', name: 'DPT_Value_TemperatureDifference' },
  { id: 'DPST-14-071', name: 'DPT_Value_Thermal_Capacity' },
  { id: 'DPST-14-072', name: 'DPT_Value_Thermal_Conductivity' },
  { id: 'DPST-14-073', name: 'DPT_Value_ThermoelectricPower' },
  { id: 'DPST-14-074', name: 'DPT_Value_Time' },
  { id: 'DPST-14-075', name: 'DPT_Value_Torque' },
  { id: 'DPST-14-076', name: 'DPT_Value_Volume' },
  { id: 'DPST-14-077', name: 'DPT_Value_Volume_Flux' },
  { id: 'DPST-14-078', name: 'DPT_Value_Weight' },
  { id: 'DPST-14-079', name: 'DPT_Value_Work' },
  { id: 'DPST-15-000', name: 'DPT_Access_Data' },
  { id: 'DPST-17-001', name: 'DPT_SceneNumber' },
  { id: 'DPST-18-001', name: 'DPT_SceneControl' },
  { id: 'DPST-19-001', name: 'DPT_DateTime' },
  { id: 'DPST-20-001', name: 'DPT_SCLOMode' },
  { id: 'DPST-20-002', name: 'DPT_BuildingMode' },
  { id: 'DPST-20-003', name: 'DPT_OccMode' },
  { id: 'DPST-20-004', name: 'DPT_Priority' },
  { id: 'DPST-20-005', name: 'DPT_LightApplicationMode' },
  { id: 'DPST-20-006', name: 'DPT_ApplicationArea' },
  { id: 'DPST-20-007', name: 'DPT_AlarmClassType' },
  { id: 'DPST-20-008', name: 'DPT_PSUMode' },
  { id: 'DPST-20-011', name: 'DPT_ErrorClass_System' },
  { id: 'DPST-20-012', name: 'DPT_ErrorClass_HVAC' },
  { id: 'DPST-20-013', name: 'DPT_Time_Delay' },
  { id: 'DPST-20-014', name: 'DPT_Beaufort_Wind_Force_Scale' },
  { id: 'DPST-20-017', name: 'DPT_SensorSelect' },
  { id: 'DPST-20-020', name: 'DPT_ActuatorConnectType' },
  { id: 'DPST-20-100', name: 'DPT_FuelType' },
  { id: 'DPST-20-101', name: 'DPT_BurnerType' },
  { id: 'DPST-20-102', name: 'DPT_HVACMode' },
  { id: 'DPST-20-103', name: 'DPT_DHWMode' },
  { id: 'DPST-20-104', name: 'DPT_LoadPriority' },
  { id: 'DPST-20-105', name: 'DPT_HVACContrMode' },
  { id: 'DPST-20-106', name: 'DPT_HVACEmergMode' },
  { id: 'DPST-20-107', name: 'DPT_ChangeoverMode' },
  { id: 'DPST-20-108', name: 'DPT_ValveMode' },
  { id: 'DPST-20-109', name: 'DPT_DamperMode' },
  { id: 'DPST-20-110', name: 'DPT_HeaterMode' },
  { id: 'DPST-20-111', name: 'DPT_FanMode' },
  { id: 'DPST-20-112', name: 'DPT_MasterSlaveMode' },
  { id: 'DPST-20-113', name: 'DPT_StatusRoomSetp' },
  { id: 'DPST-20-120', name: 'DPT_ADAType' },
  { id: 'DPST-20-121', name: 'DPT_BackupMode' },
  { id: 'DPST-20-122', name: 'DPT_StartSynchronization' },
  { id: 'DPST-20-600', name: 'DPT_Behaviour_Lock_Unlock' },
  { id: 'DPST-20-601', name: 'DPT_Behaviour_Bus_Power_Up_Down' },
  { id: 'DPST-20-602', name: 'DPT_DALI_Fade_Time' },
  { id: 'DPST-20-603', name: 'DPT_BlinkingMode' },
  { id: 'DPST-20-604', name: 'DPT_LightControlMode' },
  { id: 'DPST-20-605', name: 'DPT_SwitchPBModel' },
  { id: 'DPST-20-606', name: 'DPT_PBAction' },
  { id: 'DPST-20-607', name: 'DPT_DimmPBModel' },
  { id: 'DPST-20-608', name: 'DPT_SwitchOnMode' },
  { id: 'DPST-20-609', name: 'DPT_LoadTypeSet' },
  { id: 'DPST-20-610', name: 'DPT_LoadTypeDetected' },
  { id: 'DPST-20-801', name: 'DPT_SABExceptBehaviour' },
  { id: 'DPST-20-802', name: 'DPT_SABBehaviour_Lock_Unlock' },
  { id: 'DPST-20-803', name: 'DPT_SSSBMode' },
  { id: 'DPST-20-804', name: 'DPT_BlindsControlMode' },
  { id: 'DPST-20-1000', name: 'DPT_CommMode' },
  { id: 'DPST-20-1001', name: 'DPT_AddInfoTypes' },
  { id: 'DPST-20-1002', name: 'DPT_RF_ModeSelect' },
  { id: 'DPST-20-1003', name: 'DPT_RF_FilterSelect' },
  { id: 'DPST-21-001', name: 'DPT_StatusGen' },
  { id: 'DPST-21-002', name: 'DPT_Device_Control' },
  { id: 'DPST-21-100', name: 'DPT_ForceSign' },
  { id: 'DPST-21-101', name: 'DPT_ForceSignCool' },
  { id: 'DPST-21-102', name: 'DPT_StatusRHC' },
  { id: 'DPST-21-103', name: 'DPT_StatusSDHWC' },
  { id: 'DPST-21-104', name: 'DPT_FuelTypeSet' },
  { id: 'DPST-21-105', name: 'DPT_StatusRCC' },
  { id: 'DPST-21-106', name: 'DPT_StatusAHU' },
  { id: 'DPST-21-601', name: 'DPT_LightActuatorErrorInfo' },
  { id: 'DPST-21-1000', name: 'DPT_RF_ModeInfo' },
  { id: 'DPST-21-1001', name: 'DPT_RF_FilterInfo' },
  { id: 'DPST-21-1010', name: 'DPT_Channel_Activation_8' },
  { id: 'DPST-22-100', name: 'DPT_StatusDHWC' },
  { id: 'DPST-22-101', name: 'DPT_StatusRHCC' },
  { id: 'DPST-22-1000', name: 'DPT_Media' },
  { id: 'DPST-22-1010', name: 'DPT_Channel_Activation_16' },
  { id: 'DPST-23-001', name: 'DPT_OnOffAction' },
  { id: 'DPST-23-002', name: 'DPT_Alarm_Reaction' },
  { id: 'DPST-23-003', name: 'DPT_UpDown_Action' },
  { id: 'DPST-23-102', name: 'DPT_HVAC_PB_Action' },
  { id: 'DPST-25-1000', name: 'DPT_DoubleNibble' },
  { id: 'DPST-26-001', name: 'DPT_SceneInfo' },
  { id: 'DPST-27-001', name: 'DPT_CombinedInfoOnOff' },
  { id: 'DPST-29-010', name: 'DPT_ActiveEnergy_V64' },
  { id: 'DPST-29-011', name: 'DPT_ApparantEnergy_V64' },
  { id: 'DPST-29-012', name: 'DPT_ReactiveEnergy_V64' },
  { id: 'DPST-30-1010', name: 'DPT_Channel_Activation_24' },
  { id: 'DPST-200-100', name: 'DPT_Heat/Cool_Z' },
  { id: 'DPST-200-101', name: 'DPT_BinaryValue_Z' },
  { id: 'DPST-201-100', name: 'DPT_HVACMode_Z' },
  { id: 'DPST-201-102', name: 'DPT_DHWMode_Z' },
  { id: 'DPST-201-104', name: 'DPT_HVACContrMode_Z' },
  { id: 'DPST-201-105', name: 'DPT_EnableH/Cstage_Z' },
  { id: 'DPST-201-107', name: 'DPT_BuildingMode_Z' },
  { id: 'DPST-201-108', name: 'DPT_OccMode_Z' },
  { id: 'DPST-201-109', name: 'DPT_HVACEmergMode_Z' },
  { id: 'DPST-202-001', name: 'DPT_RelValue_Z' },
  { id: 'DPST-202-002', name: 'DPT_UCountValue8_Z' },
  { id: 'DPST-203-002', name: 'DPT_TimePeriodMsec_Z' },
  { id: 'DPST-203-003', name: 'DPT_TimePeriod10Msec_Z' },
  { id: 'DPST-203-004', name: 'DPT_TimePeriod100Msec_Z' },
  { id: 'DPST-203-005', name: 'DPT_TimePeriodSec_Z' },
  { id: 'DPST-203-006', name: 'DPT_TimePeriodMin_Z' },
  { id: 'DPST-203-007', name: 'DPT_TimePeriodHrs_Z' },
  { id: 'DPST-203-011', name: 'DPT_UFlowRateLiter/h_Z' },
  { id: 'DPST-203-012', name: 'DPT_UCountValue16_Z' },
  { id: 'DPST-203-013', name: 'DPT_UElCurrentuA_Z' },
  { id: 'DPST-203-014', name: 'DPT_PowerKW_Z' },
  { id: 'DPST-203-015', name: 'DPT_AtmPressureAbs_Z' },
  { id: 'DPST-203-017', name: 'DPT_PercentU16_Z' },
  { id: 'DPST-203-100', name: 'DPT_HVACAirQual_Z' },
  { id: 'DPST-203-101', name: 'DPT_WindSpeed_Z' },
  { id: 'DPST-203-102', name: 'DPT_SunIntensity_Z' },
  { id: 'DPST-203-104', name: 'DPT_HVACAirFlowAbs_Z' },
  { id: 'DPST-204-001', name: 'DPT_RelSignedValue_Z' },
  { id: 'DPST-205-002', name: 'DPT_DeltaTimeMsec_Z' },
  { id: 'DPST-205-003', name: 'DPT_DeltaTime10Msec_Z' },
  { id: 'DPST-205-004', name: 'DPT_DeltaTime100Msec_Z' },
  { id: 'DPST-205-005', name: 'DPT_DeltaTimeSec_Z' },
  { id: 'DPST-205-006', name: 'DPT_DeltaTimeMin_Z' },
  { id: 'DPST-205-007', name: 'DPT_DeltaTimeHrs_Z' },
  { id: 'DPST-205-017', name: 'DPT_Percent_V16_Z' },
  { id: 'DPST-205-100', name: 'DPT_TempHVACAbs_Z' },
  { id: 'DPST-205-101', name: 'DPT_TempHVACRel_Z' },
  { id: 'DPST-205-102', name: 'DPT_HVACAirFlowRel_Z' },
  { id: 'DPST-206-100', name: 'DPT_HVACModeNext' },
  { id: 'DPST-206-102', name: 'DPT_DHWModeNext' },
  { id: 'DPST-206-104', name: 'DPT_OccModeNext' },
  { id: 'DPST-206-105', name: 'DPT_BuildingModeNext' },
  { id: 'DPST-207-100', name: 'DPT_StatusBUC' },
  { id: 'DPST-207-101', name: 'DPT_LockSign' },
  { id: 'DPST-207-102', name: 'DPT_ValueDemBOC' },
  { id: 'DPST-207-104', name: 'DPT_ActPosDemAbs' },
  { id: 'DPST-207-105', name: 'DPT_StatusAct' },
  { id: 'DPST-207-600', name: 'DPT_StatusLightingActuator' },
  { id: 'DPST-209-100', name: 'DPT_StatusHPM' },
  { id: 'DPST-209-101', name: 'DPT_TempRoomDemAbs' },
  { id: 'DPST-209-102', name: 'DPT_StatusCPM' },
  { id: 'DPST-209-103', name: 'DPT_StatusWTC' },
  { id: 'DPST-210-100', name: 'DPT_TempFlowWaterDemAbs' },
  { id: 'DPST-211-100', name: 'DPT_EnergyDemWater' },
  { id: 'DPST-212-100', name: 'DPT_TempRoomSetpSetShift3' },
  { id: 'DPST-212-101', name: 'DPT_TempRoomSetpSet3' },
  { id: 'DPST-213-100', name: 'DPT_TempRoomSetpSet4' },
  { id: 'DPST-213-101', name: 'DPT_TempDHWSetpSet4' },
  { id: 'DPST-213-102', name: 'DPT_TempRoomSetpSetShift4' },
  { id: 'DPST-214-100', name: 'DPT_PowerFlowWaterDemHPM' },
  { id: 'DPST-214-101', name: 'DPT_PowerFlowWaterDemCPM' },
  { id: 'DPST-215-100', name: 'DPT_StatusBOC' },
  { id: 'DPST-215-101', name: 'DPT_StatusCC' },
  { id: 'DPST-216-100', name: 'DPT_SpecHeatProd' },
  { id: 'DPST-217-001', name: 'DPT_Version' },
  { id: 'DPST-218-001', name: 'DPT_VolumeLiter_Z' },
  { id: 'DPST-218-002', name: 'DPT_FlowRate_m3/h_Z' },
  { id: 'DPST-219-001', name: 'DPT_AlarmInfo' },
  { id: 'DPST-220-100', name: 'DPT_TempHVACAbsNext' },
  { id: 'DPST-221-001', name: 'DPT_SerNum' },
  { id: 'DPST-222-100', name: 'DPT_TempRoomSetpSetF16_3' },
  { id: 'DPST-222-101', name: 'DPT_TempRoomSetpSetShiftF16_3' },
  { id: 'DPST-223-100', name: 'DPT_EnergyDemAir' },
  { id: 'DPST-224-100', name: 'DPT_TempSupplyAirSetpSet' },
  { id: 'DPST-225-001', name: 'DPT_ScalingSpeed' },
  { id: 'DPST-225-002', name: 'DPT_Scaling_Step_Time' },
  { id: 'DPST-225-003', name: 'DPT_TariffNext' },
  { id: 'DPST-229-001', name: 'DPT_MeteringValue' },
  { id: 'DPST-230-1000', name: 'DPT_MBus_Address' },
  { id: 'DPST-231-001', name: 'DPT_Locale_ASCII' },
  { id: 'DPST-232-600', name: 'DPT_Colour_RGB' },
  { id: 'DPST-234-001', name: 'DPT_LanguageCodeAlpha2' },
  { id: 'DPST-234-002', name: 'DPT_RegionCodeAlpha2' },
  { id: 'DPST-235-001', name: 'DPT_Tariff_ActiveEnergy' },
  { id: 'DPST-236-001', name: 'DPT_Prioritised_Mode_Control' },
  { id: 'DPST-237-600', name: 'DPT_DALI_Control_Gear_Diagnostic' },
  { id: 'DPST-238-001', name: 'DPT_SceneConfig' },
  { id: 'DPST-238-600', name: 'DPT_DALI_Diagnostic' },
  { id: 'DPST-239-001', name: 'DPT_FlaggedScaling' },
  { id: 'DPST-240-800', name: 'DPT_CombinedPosition' },
  { id: 'DPST-241-800', name: 'DPT_StatusSAB' },
];

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
    { n: 'CTR',         full: 'On/Off',             dpt: 'DPST-1-001',  t: 'ctrl', mid: 0, midName: 'Enable'     },
    { n: 'SETPoint',    full: 'Setpoint',           dpt: 'DPST-9-001',  t: 'ctrl', mid: 1, midName: 'Setp'       },
    { n: 'MODE',        full: 'HVAC mode',          dpt: 'DPST-20-102', t: 'ctrl', mid: 2, midName: 'Mode'       },
    { n: 'FAN',         full: 'Fan speed',          dpt: 'DPST-5-001',  t: 'ctrl', mid: 3, midName: 'Fan'        },
    { n: 'SETP_OFFSET', full: 'Setpoint offset',    dpt: 'DPST-9-002',  t: 'ctrl', mid: 4, midName: 'SeptOffset' },
    { n: 'VALVE_CMD',   full: 'Valve command',      dpt: 'DPST-5-001',  t: 'ctrl', mid: 5, midName: 'ValveCmd'   },
    { n: 'SWING',       full: 'Swing / louver',     dpt: 'DPST-5-010',  t: 'ctrl', mid: 6, midName: 'Swing'      },
    { n: 'LOCK',        full: 'Remote lock',        dpt: 'DPST-1-001',  t: 'ctrl', mid: 7, midName: 'Lock'       },
    { n: 'CTR_FB',      full: 'Actual temperature', dpt: 'DPST-9-001',  t: 'fb',   mid: 0, midName: 'TempAct'    },
    { n: 'SETPoint_FB', full: 'Setpoint feedback',  dpt: 'DPST-9-001',  t: 'fb',   mid: 1, midName: 'SeptFb'     },
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
    { n: 'POWER',  full: 'Power on/off',    dpt: 'DPST-1-001', t: 'ctrl', mid: 0, midName: 'Power'  },
    { n: 'SOURCE', full: 'Source select',   dpt: 'DPST-5-001', t: 'ctrl', mid: 1, midName: 'Source' },
    { n: 'VOL',    full: 'Volume',          dpt: 'DPST-5-001', t: 'ctrl', mid: 2, midName: 'Vol'    },
    { n: 'VOL_FB', full: 'Volume feedback', dpt: 'DPST-5-001', t: 'fb',   mid: 8, midName: 'VolFb'  },
    { n: 'MUTE',     full: 'Mute',            dpt: 'DPST-1-001', t: 'ctrl', mid: 3, midName: 'Mute'     },
    { n: 'PREVIOUS', full: 'Previous track', dpt: 'DPST-1-001', t: 'ctrl', mid: 4, midName: 'Previous' },
    { n: 'PAUSE',    full: 'Play / Pause',   dpt: 'DPST-1-001', t: 'ctrl', mid: 5, midName: 'Pause'    },
    { n: 'NEXT',     full: 'Next track',     dpt: 'DPST-1-001', t: 'ctrl', mid: 7, midName: 'Next'     }
  ],
  nrg_meter: [
    { n: 'POWER',        full: 'Active power W',  dpt: 'DPST-14-056', t: 'fb', mid: 0, midName: 'Power'       },
    { n: 'ENERGY',       full: 'Energy kWh',      dpt: 'DPST-13-010', t: 'fb', mid: 1, midName: 'Energy'      },
    { n: 'VOLTAGE',      full: 'Voltage V',       dpt: 'DPST-14-027', t: 'fb', mid: 2, midName: 'Voltage'     },
    { n: 'CURRENT',      full: 'Current A',       dpt: 'DPST-14-019', t: 'fb', mid: 3, midName: 'Current'     },
    { n: 'POWER_FACTOR', full: 'Power factor',    dpt: 'DPST-14-057', t: 'fb', mid: 4, midName: 'PowerFactor' }
  ],
  sys_unit: [
    { n: 'TIME',        full: 'Time',             dpt: 'DPST-10-001', t: 'fb',   mid: 0, midName: 'TimeDate' },
    { n: 'DATE',        full: 'Date',             dpt: 'DPST-11-001', t: 'fb',   mid: 0, midName: 'TimeDate' },
    { n: 'SUNRISE',     full: 'Sunrise',          dpt: 'DPST-10-001', t: 'fb',   mid: 0, midName: 'TimeDate' },
    { n: 'SUNSET',      full: 'Sunset',           dpt: 'DPST-10-001', t: 'fb',   mid: 0, midName: 'TimeDate' },
    { n: 'OCC_MODE',    full: 'Occupancy_Mode',   dpt: 'DPST-5-001',  t: 'ctrl', mid: 1, midName: 'Mode'     },
    { n: 'NIGHT_MODE',  full: 'Night_Mode',       dpt: 'DPST-1-001',  t: 'ctrl', mid: 1, midName: 'Mode'     },
    { n: 'GUEST_MODE',  full: 'Guest_Mode',       dpt: 'DPST-1-001',  t: 'ctrl', mid: 1, midName: 'Mode'     },
    { n: 'HEARTBEAT',   full: 'IP_GW_Heartbeat',  dpt: 'DPST-1-001',  t: 'fb',   mid: 2, midName: 'Diag'     },
    { n: 'BUS_VOLTAGE', full: 'Bus_Voltage',      dpt: 'DPST-14-027', t: 'fb',   mid: 2, midName: 'Diag'     }
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

    // ── GLOBAL systems — generate once, no floor/room loop ──────────────────
    if (si.global) {
      const cset = circuitGaSet[`${sk}_unit`] || gasets[sk];
      cset.forEach((ga, gi) => {
        const sub = nextSub(mainNum, ga.mid);
        gas.push({
          addr:     `${mainNum}/${ga.mid}/${sub}`,
          name:     `${px} - ${ga.full}`,
          dpt:      ga.dpt,
          type:     ga.t,
          main:     mainNum,
          mid:      ga.mid,
          midName:  ga.midName,
          mainName: si.name_en,
          _id:      `${sk}_global_${gi}`
        });
        advanceSub(mainNum, ga.mid, 1);
      });
      return;
    }

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

# KNX Group Address — 3-Level Format (x/y/z)

> **Rule:** MAIN GROUP `0 ≤ x ≤ 15` | MIDDLE GROUP `0 ≤ y ≤ 7` | SUB GROUP `0 ≤ z ≤ 255`

---

## 0 / CENTRAL

### 0/0 / Scene
| Address | Name |
|---------|------|
| 0/0/1   | Scene - All Off |
| 0/0/2   | Scene - Welcome |
| 0/0/3   | Scene - Away |
| 0/0/4   | Scene - Night |
| 0/0/5   | Scene - Cinema |
| 0/0/6   | Scene - Dinner |
| 0/0/10  | Scene - FB |

### 0/1 / Alarm Logic
| Address | Name |
|---------|------|
| 0/1/1   | Panic |
| 0/1/2   | Fire Alarm Global |
| 0/1/3   | Burglar Alarm Global |

---

## 1 / LIGHTING

### 1/0 / Switch
| Address | Name |
|---------|------|
| 1/0/1   | LT - LivingRoom - Ceiling - SW |
| 1/0/2   | LT - LivingRoom - Accent - SW |
| 1/0/3   | LT - DiningRoom - Pendant - SW |
| 1/0/4   | LT - Kitchen - Ceiling - SW |
| 1/0/5   | LT - Kitchen - Cabinet - SW |
| 1/0/10  | LT - MasterBed - Ceiling - SW |
| 1/0/11  | LT - MasterBed - Headboard - SW |
| 1/0/20  | LT - Bathroom1 - Mirror - SW |
| ...     | *(tiếp tục theo phòng)* |

### 1/1 / Switch Feedback
| Address | Name |
|---------|------|
| 1/1/1   | LT - LivingRoom - Ceiling - FB |
| 1/1/2   | LT - LivingRoom - Accent - FB |
| ...     | *(index tương ứng 1:1 với Switch)* |

### 1/2 / Dimming
| Address | Name |
|---------|------|
| 1/2/1   | LT - LivingRoom - Ceiling - DIM |
| 1/2/2   | LT - LivingRoom - Accent - DIM |
| ...     | |

### 1/3 / Dim Value
| Address | Name |
|---------|------|
| 1/3/1   | LT - LivingRoom - Ceiling - VAL |
| ...     | |

### 1/4 / Dim Value Feedback
| Address | Name |
|---------|------|
| 1/4/1   | LT - LivingRoom - Ceiling - VALFB |
| ...     | |

### 1/5 / Color Temperature
| Address | Name |
|---------|------|
| 1/5/1   | LT - LivingRoom - Ceiling - CCT |
| 1/5/2   | LT - LivingRoom - Ceiling - CCT_FB |

### 1/6 / RGBW
| Address | Name |
|---------|------|
| 1/6/1   | LT - LivingRoom - Accent - RGB |
| 1/6/2   | LT - LivingRoom - Accent - RGB_FB |

### 1/7 / Light Group (Savant zone control)
| Address | Name |
|---------|------|
| 1/7/1   | LT_GRP - LivingArea - All - SW |
| 1/7/2   | LT_GRP - LivingArea - All - VAL |
| 1/7/3   | LT_GRP - Bedroom - All - SW |

---

## 2 / PRESENCE

### 2/0 / Status
| Address | Name |
|---------|------|
| 2/0/1   | PRES - LivingRoom - STATUS |
| 2/0/2   | PRES - Kitchen - STATUS |
| 2/0/3   | PRES - MasterBed - STATUS |
| 2/0/4   | PRES - Corridor - STATUS |

### 2/1 / Lock (disable sensor)
| Address | Name |
|---------|------|
| 2/1/1   | PRES - LivingRoom - LOCK |
| 2/1/2   | PRES - MasterBed - LOCK |

### 2/2 / Brightness Value
| Address | Name |
|---------|------|
| 2/2/1   | PRES - LivingRoom - LUX |
| 2/2/2   | PRES - MasterBed - LUX |

---

## 3 / SHUTTER

### 3/0 / Move Up/Down
| Address | Name |
|---------|------|
| 3/0/1   | SHT - LivingRoom - Left - MOVE |
| 3/0/2   | SHT - LivingRoom - Right - MOVE |
| 3/0/3   | SHT - MasterBed - MOVE |
| 3/0/4   | SHT - Bathroom1 - MOVE |

### 3/1 / Step/Stop
| Address | Name |
|---------|------|
| 3/1/1   | SHT - LivingRoom - Left - STEP |
| 3/1/2   | SHT - LivingRoom - Right - STEP |
| ...     | |

### 3/2 / Position (0–255)
| Address | Name |
|---------|------|
| 3/2/1   | SHT - LivingRoom - Left - POS |
| ...     | |

### 3/3 / Position Feedback
| Address | Name |
|---------|------|
| 3/3/1   | SHT - LivingRoom - Left - POS_FB |
| ...     | |

### 3/4 / Slat/Tilt
| Address | Name |
|---------|------|
| 3/4/1   | SHT - LivingRoom - Left - TILT |
| ...     | |

### 3/5 / Tilt Feedback
| Address | Name |
|---------|------|
| 3/5/1   | SHT - LivingRoom - Left - TILT_FB |

### 3/6 / Wind / Rain (safety lockout)
| Address | Name |
|---------|------|
| 3/6/1   | SHT - WIND_ALARM |
| 3/6/2   | SHT - RAIN_ALARM |
| 3/6/3   | SHT - WIND_SPEED |

### 3/7 / Shutter Group
| Address | Name |
|---------|------|
| 3/7/1   | SHT_GRP - All - MOVE |
| 3/7/2   | SHT_GRP - LivingArea - MOVE |
| 3/7/3   | SHT_GRP - Bedroom - MOVE |

---

## 4 / HVAC CONTROL *(Tín hiệu điều khiển — Write)*

> Tất cả group trong Main 4 là **tín hiệu ghi xuống thiết bị**: lệnh bật/tắt, setpoint, mode, fan...
> Index z theo phòng: `1`=LivingRoom, `2`=MasterBed, `3`=Bed2, `4`=Bed3, `5`=Kitchen, `6`=DiningRoom, `7`=HomeOffice, `8`=Corridor, `9`=Bathroom1, `10`=Bathroom2, `20`=AHU-Central

---

### 4/0 / On / Off (Enable)
> DPT 1.001 — Bool (0=Off, 1=On)
> Áp dụng cho: FCU, Split AC, Thermostat, Radiant Panel, AHU

| Address | Name |
|---------|------|
| 4/0/1   | HVAC - LivingRoom - ENABLE |
| 4/0/2   | HVAC - MasterBed - ENABLE |
| 4/0/3   | HVAC - Bed2 - ENABLE |
| 4/0/4   | HVAC - Bed3 - ENABLE |
| 4/0/5   | HVAC - Kitchen - ENABLE |
| 4/0/6   | HVAC - DiningRoom - ENABLE |
| 4/0/7   | HVAC - HomeOffice - ENABLE |
| 4/0/20  | HVAC - AHU-Central - ENABLE |

---

### 4/1 / Setpoint Temperature
> DPT 9.001 — 2-byte float (°C), range thực tế: 16.0–30.0°C
> Áp dụng cho: mọi thermostat có setpoint

| Address | Name |
|---------|------|
| 4/1/1   | HVAC - LivingRoom - SETP |
| 4/1/2   | HVAC - MasterBed - SETP |
| 4/1/3   | HVAC - Bed2 - SETP |
| 4/1/4   | HVAC - Bed3 - SETP |
| 4/1/5   | HVAC - Kitchen - SETP |
| 4/1/6   | HVAC - DiningRoom - SETP |
| 4/1/7   | HVAC - HomeOffice - SETP |
| 4/1/20  | HVAC - AHU-Central - SETP |

---

### 4/2 / Operating Mode
> DPT 20.102 — 1-byte enum
> `0`=Auto `1`=Heat `2`=Cool `3`=Fan Only `4`=Dry `5`=Eco `6`=Boost
> Áp dụng cho: Split AC, FCU, VRF, AHU; Thermostat thuần Heating chỉ dùng 0/1/5

| Address | Name |
|---------|------|
| 4/2/1   | HVAC - LivingRoom - MODE |
| 4/2/2   | HVAC - MasterBed - MODE |
| 4/2/3   | HVAC - Bed2 - MODE |
| 4/2/4   | HVAC - Bed3 - MODE |
| 4/2/5   | HVAC - Kitchen - MODE |
| 4/2/6   | HVAC - DiningRoom - MODE |
| 4/2/7   | HVAC - HomeOffice - MODE |
| 4/2/20  | HVAC - AHU-Central - MODE |

---

### 4/3 / Fan Speed
> DPT 5.001 — 1-byte % (0–100%) hoặc DPT 5.010 enum: `0`=Auto `1`=Low `2`=Med `3`=High `4`=Turbo
> Áp dụng cho: FCU, Split AC, VRF, AHU

| Address | Name |
|---------|------|
| 4/3/1   | HVAC - LivingRoom - FAN |
| 4/3/2   | HVAC - MasterBed - FAN |
| 4/3/3   | HVAC - Bed2 - FAN |
| 4/3/4   | HVAC - Bed3 - FAN |
| 4/3/5   | HVAC - Kitchen - FAN |
| 4/3/6   | HVAC - DiningRoom - FAN |
| 4/3/7   | HVAC - HomeOffice - FAN |
| 4/3/20  | HVAC - AHU-Central - FAN |

---

### 4/4 / Setpoint Offset (Eco / Comfort Shift)
> DPT 9.002 — 2-byte float (±°C delta), thường –5.0 đến +5.0
> Dùng khi muốn điều chỉnh offset tương đối thay vì ghi setpoint tuyệt đối
> Áp dụng cho: thermostat hỗ trợ Eco offset (KNX Thermokon, MDT, Siemens DESIGO, Steca)

| Address | Name |
|---------|------|
| 4/4/1   | HVAC - LivingRoom - SETP_OFFSET |
| 4/4/2   | HVAC - MasterBed - SETP_OFFSET |
| 4/4/3   | HVAC - Bed2 - SETP_OFFSET |
| 4/4/7   | HVAC - HomeOffice - SETP_OFFSET |
| 4/4/20  | HVAC - AHU-Central - SETP_OFFSET |

---

### 4/5 / Valve / Actuator Control
> DPT 5.001 — 1-byte % (0–100%) hoặc DPT 1.001 Bool (On/Off)
> Áp dụng cho: hệ Radiant Floor/Ceiling, FCU valve, Hydronic system
> Ghi trực tiếp đến actuator khi không qua thermostat loop

| Address | Name |
|---------|------|
| 4/5/1   | HVAC - LivingRoom - VALVE_CMD |
| 4/5/2   | HVAC - MasterBed - VALVE_CMD |
| 4/5/3   | HVAC - Bed2 - VALVE_CMD |
| 4/5/4   | HVAC - Bed3 - VALVE_CMD |
| 4/5/5   | HVAC - Kitchen - VALVE_CMD |
| 4/5/6   | HVAC - DiningRoom - VALVE_CMD |
| 4/5/7   | HVAC - HomeOffice - VALVE_CMD |

---

### 4/6 / Swing / Louver Direction
> DPT 5.010 — 1-byte enum: `0`=Auto `1`=Fixed-Low `2`=Fixed-Mid `3`=Fixed-High `4`=Swing
> Áp dụng cho: Split AC, VRF cassette, ducted với motorized louver

| Address | Name |
|---------|------|
| 4/6/1   | HVAC - LivingRoom - SWING |
| 4/6/2   | HVAC - MasterBed - SWING |
| 4/6/3   | HVAC - Bed2 - SWING |

---

### 4/7 / Lock / Child Lock / Remote Inhibit
> DPT 1.001 — Bool (0=Unlock, 1=Lock)
> Áp dụng cho: thermostat có display lock (MDT, Siemens, Elsner, Interra)
> Khi Lock=1: người dùng không thể thay đổi tại thermostat vật lý

| Address | Name |
|---------|------|
| 4/7/1   | HVAC - LivingRoom - LOCK |
| 4/7/2   | HVAC - MasterBed - LOCK |
| 4/7/3   | HVAC - Bed2 - LOCK |
| 4/7/4   | HVAC - Bed3 - LOCK |
| 4/7/7   | HVAC - HomeOffice - LOCK |

---

## 5 / HVAC FEEDBACK *(Tín hiệu phản hồi — Read / Status)*

> Tất cả group trong Main 5 là **tín hiệu đọc từ thiết bị về**: nhiệt độ thực, trạng thái, chất lượng không khí...
> Index z theo phòng giống Main 4: `1`=LivingRoom, `2`=MasterBed, `3`=Bed2, `4`=Bed3, `5`=Kitchen, `6`=DiningRoom, `7`=HomeOffice, `8`=Corridor, `9`=Bathroom1, `10`=Bathroom2, `20`=AHU-Central

---

### 5/0 / Temperature Actual (Current Room Temp)
> DPT 9.001 — 2-byte float (°C)
> Nguồn: cảm biến tích hợp trong thermostat hoặc remote sensor NTC/PT1000
> Áp dụng cho: mọi thermostat có đo nhiệt độ phòng

| Address | Name |
|---------|------|
| 5/0/1   | HVAC - LivingRoom - TEMP_ACT |
| 5/0/2   | HVAC - MasterBed - TEMP_ACT |
| 5/0/3   | HVAC - Bed2 - TEMP_ACT |
| 5/0/4   | HVAC - Bed3 - TEMP_ACT |
| 5/0/5   | HVAC - Kitchen - TEMP_ACT |
| 5/0/6   | HVAC - DiningRoom - TEMP_ACT |
| 5/0/7   | HVAC - HomeOffice - TEMP_ACT |
| 5/0/8   | HVAC - Corridor - TEMP_ACT |
| 5/0/9   | HVAC - Bathroom1 - TEMP_ACT |
| 5/0/10  | HVAC - Bathroom2 - TEMP_ACT |
| 5/0/20  | HVAC - AHU-Central - TEMP_SUPPLY |
| 5/0/21  | HVAC - AHU-Central - TEMP_RETURN |
| 5/0/22  | HVAC - AHU-Central - TEMP_OUTDOOR |

---

### 5/1 / Setpoint Feedback
> DPT 9.001 — 2-byte float (°C)
> Phản hồi giá trị setpoint đang active tại thermostat (sau khi offset, schedule, override)

| Address | Name |
|---------|------|
| 5/1/1   | HVAC - LivingRoom - SETP_FB |
| 5/1/2   | HVAC - MasterBed - SETP_FB |
| 5/1/3   | HVAC - Bed2 - SETP_FB |
| 5/1/4   | HVAC - Bed3 - SETP_FB |
| 5/1/5   | HVAC - Kitchen - SETP_FB |
| 5/1/6   | HVAC - DiningRoom - SETP_FB |
| 5/1/7   | HVAC - HomeOffice - SETP_FB |
| 5/1/20  | HVAC - AHU-Central - SETP_FB |

---

### 5/2 / Mode Feedback
> DPT 20.102 — 1-byte enum (giống 4/2)
> Trạng thái mode đang chạy thực tế (auto resolved)

| Address | Name |
|---------|------|
| 5/2/1   | HVAC - LivingRoom - MODE_FB |
| 5/2/2   | HVAC - MasterBed - MODE_FB |
| 5/2/3   | HVAC - Bed2 - MODE_FB |
| 5/2/4   | HVAC - Bed3 - MODE_FB |
| 5/2/5   | HVAC - Kitchen - MODE_FB |
| 5/2/6   | HVAC - DiningRoom - MODE_FB |
| 5/2/7   | HVAC - HomeOffice - MODE_FB |
| 5/2/20  | HVAC - AHU-Central - MODE_FB |

---

### 5/3 / Fan Speed Feedback
> DPT 5.001 — 1-byte % hoặc DPT 5.010 enum

| Address | Name |
|---------|------|
| 5/3/1   | HVAC - LivingRoom - FAN_FB |
| 5/3/2   | HVAC - MasterBed - FAN_FB |
| 5/3/3   | HVAC - Bed2 - FAN_FB |
| 5/3/4   | HVAC - Bed3 - FAN_FB |
| 5/3/5   | HVAC - Kitchen - FAN_FB |
| 5/3/6   | HVAC - DiningRoom - FAN_FB |
| 5/3/7   | HVAC - HomeOffice - FAN_FB |
| 5/3/20  | HVAC - AHU-Central - FAN_FB |

---

### 5/4 / Valve / Output Status Feedback
> DPT 5.001 — 1-byte % (0–100%) — mức mở van thực tế
> Áp dụng cho: Radiant, FCU, Hydronic actuator với position feedback

| Address | Name |
|---------|------|
| 5/4/1   | HVAC - LivingRoom - VALVE_FB |
| 5/4/2   | HVAC - MasterBed - VALVE_FB |
| 5/4/3   | HVAC - Bed2 - VALVE_FB |
| 5/4/4   | HVAC - Bed3 - VALVE_FB |
| 5/4/5   | HVAC - Kitchen - VALVE_FB |
| 5/4/6   | HVAC - DiningRoom - VALVE_FB |
| 5/4/7   | HVAC - HomeOffice - VALVE_FB |

---

### 5/5 / Humidity
> DPT 9.007 — 2-byte float (% RH, 0–100%)
> Nguồn: thermostat tích hợp humidity sensor hoặc sensor độc lập
> Áp dụng cho: MDT SCN-TP-UP.01, Siemens QAA, Elsner P03/P04, Interra iSwitch Pro

| Address | Name |
|---------|------|
| 5/5/1   | HVAC - LivingRoom - HUMIDITY |
| 5/5/2   | HVAC - MasterBed - HUMIDITY |
| 5/5/3   | HVAC - Bed2 - HUMIDITY |
| 5/5/4   | HVAC - Bed3 - HUMIDITY |
| 5/5/5   | HVAC - Kitchen - HUMIDITY |
| 5/5/7   | HVAC - HomeOffice - HUMIDITY |
| 5/5/8   | HVAC - Corridor - HUMIDITY |
| 5/5/20  | HVAC - AHU-Central - HUMIDITY_SUPPLY |

---

### 5/6 / CO2 / Air Quality Index
> CO2: DPT 9.008 — 2-byte float (ppm, 0–5000 ppm) — ngưỡng thông thường: Good<800 / Moderate<1200 / Poor>1200
> VOC/IAQ: DPT 9.001 — index 0–500 (IAQ scale) hoặc ppm equivalent
> Áp dụng cho: Elsner OPUS B3, Schneider MTN6005, Thermokon SR-MFT, Satel CO2 sensor, độc lập qua IPMS/IP router

| Address | Name |
|---------|------|
| 5/6/1   | IAQ - LivingRoom - CO2 |
| 5/6/2   | IAQ - MasterBed - CO2 |
| 5/6/3   | IAQ - Bed2 - CO2 |
| 5/6/4   | IAQ - Kitchen - CO2 |
| 5/6/5   | IAQ - HomeOffice - CO2 |
| 5/6/6   | IAQ - Corridor - CO2 |
| 5/6/11  | IAQ - LivingRoom - VOC |
| 5/6/12  | IAQ - MasterBed - VOC |
| 5/6/13  | IAQ - HomeOffice - VOC |
| 5/6/20  | IAQ - LivingRoom - IAQ_INDEX |
| 5/6/21  | IAQ - MasterBed - IAQ_INDEX |
| 5/6/30  | IAQ - AHU - CO2_SUPPLY |

---

### 5/7 / On/Off Status Feedback
> DPT 1.001 — Bool (0=Off, 1=On)
> Trạng thái thực tế của thiết bị (có thể khác lệnh nếu thermostat đang trong schedule/protection)

| Address | Name |
|---------|------|
| 5/7/1   | HVAC - LivingRoom - ENABLE_FB |
| 5/7/2   | HVAC - MasterBed - ENABLE_FB |
| 5/7/3   | HVAC - Bed2 - ENABLE_FB |
| 5/7/4   | HVAC - Bed3 - ENABLE_FB |
| 5/7/5   | HVAC - Kitchen - ENABLE_FB |
| 5/7/6   | HVAC - DiningRoom - ENABLE_FB |
| 5/7/7   | HVAC - HomeOffice - ENABLE_FB |
| 5/7/20  | HVAC - AHU-Central - ENABLE_FB |

---

### 📋 Bảng DPT tham chiếu nhanh

| DPT | Kiểu dữ liệu | Dùng cho |
|-----|-------------|---------|
| 1.001 | Bool (1-bit) | On/Off, Lock, Alarm |
| 5.001 | 1-byte % (0–100%) | Fan speed %, Valve % |
| 5.010 | 1-byte unsigned | Fan step enum, Mode enum |
| 9.001 | 2-byte float | Temperature (°C), Setpoint |
| 9.002 | 2-byte float | Temp offset delta (°C) |
| 9.007 | 2-byte float | Humidity (% RH) |
| 9.008 | 2-byte float | CO2 (ppm) |
| 20.102 | 1-byte enum | HVAC Operating Mode |

---

### 🏷️ Thiết bị tích hợp tham chiếu

| Hãng | Model | Tính năng nổi bật | Group dùng |
|------|-------|-------------------|-----------|
| MDT | SCN-TP-UP.01 | Touch thermostat, Humidity, CO2 opt | 4/0–4/7, 5/0–5/7 |
| Siemens | DESIGO RDG200KN | PID loop, Valve output, schedule | 4/0–4/5, 5/0–5/4 |
| Thermokon | SR-MFT | Multi-sensor: Temp/Hum/CO2/VOC/LUX | 5/0, 5/5, 5/6 |
| Elsner | OPUS B3 KNX | CO2/VOC/Temp/Hum/LUX combo | 5/0, 5/5, 5/6 |
| Interra | iSwitch Pro | Touch thermostat 6-in-1 | 4/0–4/3, 5/0–5/2 |
| Schneider | MTN6005-0001 | Room controller flush | 4/0–4/3, 5/0–5/3 |
| Daikin/Mitsubishi | via KNX gateway | VRF/Split integration | 4/0–4/6, 5/0–5/3 |
| Belimo | LMQB24A-SR KNX | Motorized valve actuator | 4/5, 5/4 |
| Satel | INT-KWIAD | AHU/Chiller integration module | 4/0, 4/2, 5/0, 5/6 |

---

## 6 / SCENES *(Room-level — Central ở Main 0)*

### 6/0 / LivingRoom Scenes
| Address | Name |
|---------|------|
| 6/0/1   | SCN - LivingRoom - Relax |
| 6/0/2   | SCN - LivingRoom - Movie |
| 6/0/3   | SCN - LivingRoom - Party |
| 6/0/10  | SCN - LivingRoom - FB |

### 6/1 / MasterBedroom Scenes
| Address | Name |
|---------|------|
| 6/1/1   | SCN - MasterBed - Sleep |
| 6/1/2   | SCN - MasterBed - Reading |
| 6/1/3   | SCN - MasterBed - WakeUp |
| 6/1/10  | SCN - MasterBed - FB |

### 6/2 / Kitchen Scenes
| Address | Name |
|---------|------|
| ...     | *(chưa định nghĩa)* |

---

## 7 / AUDIO VISUAL

### 7/0 / AV Power
| Address | Name |
|---------|------|
| 7/0/1   | AV - LivingRoom - TV - POWER |
| 7/0/2   | AV - LivingRoom - AMP - POWER |
| 7/0/3   | AV - MasterBed - TV - POWER |

### 7/1 / Source Select
| Address | Name |
|---------|------|
| 7/1/1   | AV - LivingRoom - TV - SOURCE |
| 7/1/2   | AV - LivingRoom - AMP - SOURCE |

### 7/2 / Volume
| Address | Name |
|---------|------|
| 7/2/1   | AV - LivingRoom - AMP - VOL |
| 7/2/2   | AV - LivingRoom - AMP - VOL_FB |
| 7/2/3   | AV - MasterBed - TV - VOL |

### 7/3 / Mute
| Address | Name |
|---------|------|
| 7/3/1   | AV - LivingRoom - AMP - MUTE |
| 7/3/2   | AV - MasterBed - TV - MUTE |

### 7/4 / Now Playing / Status
| Address | Name |
|---------|------|
| 7/4/1   | AV - LivingRoom - STATUS_TEXT |
| 7/4/2   | AV - MasterBed - STATUS_TEXT |

---

## 8 / ENERGY MONITORING

> Toàn bộ group 8 là **tín hiệu đọc (Read/Status)** từ energy meter, inverter, sensor.
> Index z theo nguồn/tải: `1`=MainMeter `2`=Lighting `3`=HVAC `4`=AV `5`=Sockets `6`=EV-Charger `7`=Server/IT `10`=Solar `11`=Battery `12`=Grid

---

### 8/0 / Active Power — W (Công suất tức thời)
> DPT 14.056 — 4-byte float (W)
> Áp dụng cho: Schneider iEM3xxx, ABB B-series, Siemens PAC, Finder 7E, Eltako DSRM

| Address | Name |
|---------|------|
| 8/0/1   | NRG - MainMeter - POWER |
| 8/0/2   | NRG - Lighting - POWER |
| 8/0/3   | NRG - HVAC - POWER |
| 8/0/4   | NRG - AV - POWER |
| 8/0/5   | NRG - Sockets - POWER |
| 8/0/6   | NRG - EV-Charger - POWER |
| 8/0/7   | NRG - Server - POWER |
| 8/0/10  | NRG - Solar - POWER |
| 8/0/11  | NRG - Battery - POWER |
| 8/0/12  | NRG - Grid - POWER_IMPORT |
| 8/0/13  | NRG - Grid - POWER_EXPORT |

---

### 8/1 / Active Energy Accumulated — kWh (Điện năng tích lũy)
> DPT 13.010 — 4-byte signed long (Wh) hoặc DPT 14.000 (kWh float)

| Address | Name |
|---------|------|
| 8/1/1   | NRG - MainMeter - ENERGY_TOTAL |
| 8/1/2   | NRG - Lighting - ENERGY |
| 8/1/3   | NRG - HVAC - ENERGY |
| 8/1/4   | NRG - AV - ENERGY |
| 8/1/5   | NRG - Sockets - ENERGY |
| 8/1/6   | NRG - EV-Charger - ENERGY |
| 8/1/10  | NRG - Solar - ENERGY_GENERATED |
| 8/1/11  | NRG - Battery - ENERGY_CHARGED |
| 8/1/12  | NRG - Grid - ENERGY_IMPORT |
| 8/1/13  | NRG - Grid - ENERGY_EXPORT |

---

### 8/2 / Voltage — V (Điện áp)
> DPT 14.027 — 4-byte float (V)

| Address | Name |
|---------|------|
| 8/2/1   | NRG - MainMeter - VOLTAGE_L1 |
| 8/2/2   | NRG - MainMeter - VOLTAGE_L2 |
| 8/2/3   | NRG - MainMeter - VOLTAGE_L3 |
| 8/2/10  | NRG - Solar - VOLTAGE_DC |
| 8/2/11  | NRG - Battery - VOLTAGE_DC |

---

### 8/3 / Current — A (Dòng điện)
> DPT 14.019 — 4-byte float (A)

| Address | Name |
|---------|------|
| 8/3/1   | NRG - MainMeter - CURRENT_L1 |
| 8/3/2   | NRG - MainMeter - CURRENT_L2 |
| 8/3/3   | NRG - MainMeter - CURRENT_L3 |
| 8/3/4   | NRG - MainMeter - CURRENT_N |
| 8/3/10  | NRG - Solar - CURRENT_DC |
| 8/3/11  | NRG - Battery - CURRENT_DC |

---

### 8/4 / Power Factor & Frequency
> Power Factor: DPT 14.057 — 4-byte float (0.0–1.0)
> Frequency: DPT 14.033 — 4-byte float (Hz)

| Address | Name |
|---------|------|
| 8/4/1   | NRG - MainMeter - POWER_FACTOR_L1 |
| 8/4/2   | NRG - MainMeter - POWER_FACTOR_L2 |
| 8/4/3   | NRG - MainMeter - POWER_FACTOR_L3 |
| 8/4/5   | NRG - MainMeter - FREQUENCY |

---

### 8/5 / Solar / Renewable (Năng lượng tái tạo)
> DPT 14.056 — 4-byte float (W/kWh)
> Áp dụng cho: Fronius, SMA, Huawei SUN2000, Growatt, Sungrow via KNX gateway hoặc Modbus-KNX bridge

| Address | Name |
|---------|------|
| 8/5/1   | NRG - Solar - POWER_AC |
| 8/5/2   | NRG - Solar - POWER_DC |
| 8/5/3   | NRG - Solar - ENERGY_TODAY |
| 8/5/4   | NRG - Solar - ENERGY_TOTAL |
| 8/5/5   | NRG - Solar - INVERTER_TEMP |
| 8/5/6   | NRG - Solar - INVERTER_STATUS |
| 8/5/7   | NRG - Solar - IRRADIANCE |

---

### 8/6 / Battery / Storage (Lưu trữ điện)
> SOC/SOH: DPT 5.001 — 1-byte % | Power: DPT 14.056 — 4-byte float
> Áp dụng cho: BYD Battery-Box, LG Chem RESU, Pylontech, Huawei LUNA via gateway

| Address | Name |
|---------|------|
| 8/6/1   | NRG - Battery - SOC |
| 8/6/2   | NRG - Battery - SOH |
| 8/6/3   | NRG - Battery - POWER_CHARGE |
| 8/6/4   | NRG - Battery - POWER_DISCHARGE |
| 8/6/5   | NRG - Battery - TEMP |
| 8/6/6   | NRG - Battery - STATUS |
| 8/6/7   | NRG - Battery - CYCLES |

---

### 8/7 / Demand Control / Load Management (Quản lý tải)
> DPT 9.001 — 2-byte float | DPT 1.001 — Bool cho load shedding relay
> Dùng cho peak shaving, load balancing, EV charging priority

| Address | Name |
|---------|------|
| 8/7/1   | NRG - Demand - PEAK_POWER |
| 8/7/2   | NRG - Demand - PEAK_LIMIT_CMD |
| 8/7/3   | NRG - EV-Charger - POWER_LIMIT_CMD |
| 8/7/4   | NRG - EV-Charger - STATUS |
| 8/7/5   | NRG - LoadShed - HVAC_INHIBIT |
| 8/7/6   | NRG - LoadShed - EV_INHIBIT |
| 8/7/7   | NRG - Grid - TARIFF_MODE |

---

### 📋 DPT tham chiếu — Energy

| DPT | Kiểu dữ liệu | Dùng cho |
|-----|-------------|---------|
| 5.001 | 1-byte % (0–100%) | Battery SOC, SOH |
| 9.001 | 2-byte float | Demand limit setpoint |
| 13.010 | 4-byte signed (Wh) | Energy counter tích lũy |
| 14.019 | 4-byte float | Current (A) |
| 14.027 | 4-byte float | Voltage (V) |
| 14.033 | 4-byte float | Frequency (Hz) |
| 14.056 | 4-byte float | Power (W) |
| 14.057 | 4-byte float | Power Factor |

---

### 🏷️ Thiết bị tích hợp tham chiếu — Energy

| Hãng | Model | Tính năng | Group |
|------|-------|-----------|-------|
| Schneider | iEM3155 KNX | 3-phase meter, MID certified | 8/0–8/4 |
| ABB | B24 112-100 | Power analyzer 3-phase | 8/0–8/4 |
| Siemens | PAC2200 | Multifunction power meter | 8/0–8/4 |
| Finder | 7E.46 KNX | Single-phase energy meter | 8/0–8/1 |
| Eltako | DSRM12-UC | DIN energy meter KNX | 8/0–8/1 |
| Fronius | Symo + KNX GW | Solar inverter integration | 8/5 |
| Huawei | SUN2000 + dongle | Solar + Battery | 8/5, 8/6 |
| BYD | Battery-Box + GW | Home storage | 8/6 |
| Wallbox / KEBA | via Modbus-KNX | EV Charger load control | 8/7 |

---

## 9 / SYSTEM LOGIC

### 9/0 / Time & Date (từ time server KNX)
| Address | Name |
|---------|------|
| 9/0/1   | SYS - Time |
| 9/0/2   | SYS - Date |
| 9/0/3   | SYS - Sunrise |
| 9/0/4   | SYS - Sunset |

### 9/1 / Mode Logic
| Address | Name |
|---------|------|
| 9/1/1   | SYS - Occupancy_Mode (Home/Away/Vacation) |
| 9/1/2   | SYS - Night_Mode |
| 9/1/3   | SYS - Guest_Mode |

### 9/2 / Heartbeat / Diagnostic
| Address | Name |
|---------|------|
| 9/2/1   | SYS - IP_GW_Heartbeat |
| 9/2/2   | SYS - Bus_Voltage |

---

## 10 / SECURITY

### 10/0 / Burglar Zone Status
| Address | Name |
|---------|------|
| 10/0/1  | SEC - Zone1 - Perimeter - STATUS |
| 10/0/2  | SEC - Zone2 - Interior - STATUS |
| 10/0/3  | SEC - Zone3 - Bedroom - STATUS |

### 10/1 / Arm / Disarm
| Address | Name |
|---------|------|
| 10/1/1  | SEC - Arm_Away |
| 10/1/2  | SEC - Arm_Home |
| 10/1/3  | SEC - Disarm |
| 10/1/4  | SEC - Status_FB |

### 10/2 / Door / Window Sensor
| Address | Name |
|---------|------|
| 10/2/1  | SEC - MainDoor - STATUS |
| 10/2/2  | SEC - BackDoor - STATUS |
| 10/2/3  | SEC - Window_LR1 - STATUS |

### 10/3 / Fire / Smoke
| Address | Name |
|---------|------|
| 10/3/1  | SEC - Smoke_LivingRoom - ALARM |
| 10/3/2  | SEC - Smoke_Kitchen - ALARM |
| 10/3/3  | SEC - Smoke_Global - ALARM |

### 10/4 / Siren / Output
| Address | Name |
|---------|------|
| 10/4/1  | SEC - Siren - ACTIVATE |
| 10/4/2  | SEC - StrobeLight - ACTIVATE |

---

## ✅ Tất cả lỗi đã được xử lý

| Section | Trạng thái |
|---------|-----------|
| HVAC 4/ — địa chỉ hoán đổi | ✅ Fixed & redesigned |
| HVAC 5/ — placeholder | ✅ Fixed & redesigned |
| SECURITY 10/ — sai main group `5/x/x` | ✅ Fixed |
| ENERGY 8/ — địa chỉ trùng, thiếu | ✅ Fixed & upgraded |
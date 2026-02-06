import math
import datetime

class AgriLogic:
    """
    Service for Agricultural Calculations including Irrigation needs (FAO CropWat)
    and Fertilizer recommendations.
    """
    
    # Crop Coefficients (Kc) & Stages - FAO 56 standards
    # stages: [L_ini, L_dev, L_mid, L_late] in days
    # kc: [Kc_ini, Kc_mid, Kc_end]
    # Crop Characteristics Data from Lampiran A - Tabel A.1
    # stages: [initial, vegetative, flowering, maturing] in days
    # kc: [initial, vegetative, flowering, maturing] (4 values as per table)
    # root_depth: [min, max] in meters
    # p_fraction: depletion fraction
    CROP_DATA = {
        # a. Tanaman sayuran semusim
        "brokoli": {
            "name": "Brokoli",
            "stages": [35, 45, 40, 15], 
            "root_depth": [0.4, 0.6],
            "p_fraction": 0.45,
            "kc": [0.70, 1.05, 1.05, 0.95],
            "fertilizer": {"urea": 200, "sp36": 100, "kcl": 75} # Default legacy
        },
        "kubis": {
            "name": "Kubis",
            "stages": [40, 60, 50, 15],
            "root_depth": [0.5, 0.8],
            "p_fraction": 0.45,
            "kc": [0.70, 1.05, 1.05, 0.95],
            "fertilizer": {"urea": 200, "sp36": 100, "kcl": 75}
        },
        "wortel": {
            "name": "Wortel",
            "stages": [20, 30, 30, 20],
            "root_depth": [0.5, 1.0],
            "p_fraction": 0.35,
            "kc": [0.70, 1.05, 1.05, 0.95],
            "fertilizer": {"urea": 150, "sp36": 100, "kcl": 100}
        },
        "kembang_kol": {
            "name": "Kembang Kol",
            "stages": [35, 50, 40, 15],
            "root_depth": [0.4, 0.7],
            "p_fraction": 0.45,
            "kc": [0.70, 1.05, 1.05, 0.95],
            "fertilizer": {"urea": 200, "sp36": 100, "kcl": 75}
        },
        "seledri": {
            "name": "Seledri",
            "stages": [25, 40, 45, 15],
            "root_depth": [0.3, 0.5],
            "p_fraction": 0.20,
            "kc": [0.70, 1.05, 1.05, 1.00],
            "fertilizer": {"urea": 100, "sp36": 100, "kcl": 50}
        },
        "selada": {
            "name": "Selada",
            "stages": [20, 30, 15, 10],
            "root_depth": [0.3, 0.5],
            "p_fraction": 0.30,
            "kc": [0.70, 1.00, 1.00, 0.95],
            "fertilizer": {"urea": 100, "sp36": 100, "kcl": 50}
        },
        "bawang_merah": {
            "name": "Bawang Merah",
            "stages": [15, 25, 70, 40],
            "root_depth": [0.3, 0.6],
            "p_fraction": 0.30,
            "kc": [0.70, 1.05, 1.05, 0.75],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        "daun_bawang": {
            "name": "Daun Bawang",
            "stages": [25, 30, 10, 5],
            "root_depth": [0.3, 0.6],
            "p_fraction": 0.30,
            "kc": [0.70, 1.00, 1.00, 0.95],
            "fertilizer": {"urea": 100, "sp36": 100, "kcl": 50}
        },
        "bayam": {
            "name": "Bayam",
            "stages": [20, 20, 15, 5],
            "root_depth": [0.3, 0.5],
            "p_fraction": 0.20,
            "kc": [0.70, 1.00, 1.00, 0.95],
            "fertilizer": {"urea": 100, "sp36": 100, "kcl": 50}
        },
        # b. Sayuran Solanaceae
        "terung": {
            "name": "Terung",
            "stages": [30, 40, 40, 20],
            "root_depth": [0.7, 1.2],
            "p_fraction": 0.45,
            "kc": [0.60, 1.05, 1.05, 0.90],
            "fertilizer": {"urea": 150, "sp36": 200, "kcl": 150}
        },
        "cabai": {
            "name": "Cabai",
            "stages": [30, 40, 40, 25],
            "root_depth": [0.7, 1.0],
            "p_fraction": 0.40,
            "kc": [0.60, 1.15, 1.15, 0.80],
            "fertilizer": {"urea": 150, "sp36": 200, "kcl": 150}
        },
        "tomat": {
            "name": "Tomat",
            "stages": [30, 40, 40, 25],
            "root_depth": [0.7, 1.5],
            "p_fraction": 0.40,
            "kc": [0.60, 1.15, 1.15, 0.80],
            "fertilizer": {"urea": 100, "sp36": 150, "kcl": 100}
        },
        # c. Sayuran Cucurbitaceae
        "timun": {
            "name": "Timun",
            "stages": [20, 30, 40, 15],
            "root_depth": [0.7, 1.2],
            "p_fraction": 0.50,
            "kc": [0.60, 1.00, 1.00, 0.75],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        "labu": {
            "name": "Labu",
            "stages": [25, 35, 35, 25],
            "root_depth": [1.0, 1.5],
            "p_fraction": 0.35,
            "kc": [0.50, 1.00, 1.00, 0.80],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        "melon": {
            "name": "Melon",
            "stages": [25, 35, 40, 20],
            "root_depth": [0.8, 1.5],
            "p_fraction": 0.40,
            "kc": [0.50, 0.95, 0.95, 0.75],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        "semangka": {
            "name": "Semangka",
            "stages": [20, 30, 30, 30],
            "root_depth": [0.8, 1.5],
            "p_fraction": 0.40,
            "kc": [0.40, 1.00, 1.00, 0.75],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        # d. Aneka Umbi
        "kentang": {
            "name": "Kentang",
            "stages": [25, 30, 45, 30],
            "root_depth": [0.4, 0.6],
            "p_fraction": 0.35,
            "kc": [0.50, 1.15, 1.15, 0.75],
            "fertilizer": {"urea": 150, "sp36": 150, "kcl": 100}
        },
        "ubi": {
            "name": "Ubi",
            "stages": [15, 30, 50, 30],
            "root_depth": [1.0, 1.5],
            "p_fraction": 0.65,
            "kc": [0.50, 1.15, 1.15, 0.65],
            "fertilizer": {"urea": 100, "sp36": 100, "kcl": 100}
        },
        # e. Aneka Kacang
        "kacang_hijau": {
            "name": "Kacang Hijau",
            "stages": [20, 30, 40, 20],
            "root_depth": [0.6, 0.9],
            "p_fraction": 0.45,
            "kc": [0.50, 1.05, 1.05, 0.90],
            "fertilizer": {"urea": 50, "sp36": 100, "kcl": 50}
        },
        "kacang_tanah": {
            "name": "Kacang Tanah",
            "stages": [25, 35, 45, 25],
            "root_depth": [0.5, 1.0],
            "p_fraction": 0.50,
            "kc": [0.40, 1.15, 1.15, 0.60],
            "fertilizer": {"urea": 50, "sp36": 100, "kcl": 50}
        },
        "kacang_panjang": {
            "name": "Kacang Panjang",
            "stages": [20, 30, 35, 15],
            "root_depth": [0.5, 0.8],
            "p_fraction": 0.15,
            "kc": [0.40, 1.10, 1.10, 0.55],
            "fertilizer": {"urea": 100, "sp36": 150, "kcl": 100}
        },
        "kedelai": {
            "name": "Kedelai",
            "stages": [15, 15, 40, 15],
            "root_depth": [0.6, 1.3],
            "p_fraction": 0.50,
            "kc": [0.40, 1.15, 1.15, 0.50],
            "fertilizer": {"urea": 50, "sp36": 100, "kcl": 50}
        },
        # f. Serealia
        "jagung": {
            "name": "Jagung",
            "stages": [15, 35, 40, 10], # Table d says 90 total
            "root_depth": [0.4, 1.2],
            "p_fraction": 0.50,
            "kc": [0.30, 1.15, 1.15, 0.60],
            "fertilizer": {"urea": 250, "sp36": 150, "kcl": 100}
        },
        "padi": {
            "name": "Padi",
            "stages": [30, 30, 60, 30],
            "root_depth": [0.5, 1.0],
            "p_fraction": 0.20,
            "kc": [1.05, 1.20, 1.20, 0.90],
            "fertilizer": {"urea": 200, "sp36": 100, "kcl": 75}
        }
    }

    # Soil Texture Data from Lampiran B - Tabel B.1
    # Values represent ranges [min, max] and avg_nominal in m3/m3
    SOIL_DATA = {
        "pasir": {
            "name": "Pasir (Sand)",
            "fc": [0.07, 0.17],
            "wp": [0.02, 0.07],
            "taw": [0.05, 0.11]
        },
        "pasir_berlempung": {
            "name": "Pasir Berlempung (Loamy Sand)",
            "fc": [0.11, 0.19],
            "wp": [0.03, 0.10],
            "taw": [0.06, 0.12]
        },
        "lempung_liat_berpasir": {
            "name": "Lempung Liat Berpasir (Sandy Clay Loam)",
            "fc": [0.18, 0.28],
            "wp": [0.06, 0.16],
            "taw": [0.11, 0.15]
        },
        "lempung_berpasir": {
            "name": "Lempung Berpasir (Sandy Loam)",
            "fc": [0.18, 0.28],
            "wp": [0.06, 0.16],
            "taw": [0.11, 0.15]
        },
        "lempung": {
            "name": "Lempung (Loam)",
            "fc": [0.20, 0.30],
            "wp": [0.07, 0.17],
            "taw": [0.13, 0.18]
        },
        "lempung_berdebu": {
            "name": "Lempung Berdebu (Silty Loam)",
            "fc": [0.22, 0.36],
            "wp": [0.09, 0.21],
            "taw": [0.13, 0.19]
        },
        "debu": {
            "name": "Debu (Silt)",
            "fc": [0.28, 0.36],
            "wp": [0.12, 0.22],
            "taw": [0.16, 0.20]
        },
        "lempung_liat_berdebu": {
            "name": "Lempung Liat Berdebu (Silty Clay Loam)",
            "fc": [0.30, 0.37],
            "wp": [0.17, 0.24],
            "taw": [0.13, 0.18]
        },
        "lempung_berliat": {
            "name": "Lempung Berliat (Clay Loam)",
            "fc": [0.30, 0.37],
            "wp": [0.17, 0.24],
            "taw": [0.13, 0.18]
        },
        "liat_berdebu": {
            "name": "Liat Berdebu (Silty Clay)",
            "fc": [0.30, 0.42],
            "wp": [0.17, 0.29],
            "taw": [0.13, 0.19]
        },
        "liat_berpasir": {
            "name": "Liat Berpasir (Sandy Clay)",
            "fc": [0.32, 0.40],
            "wp": [0.20, 0.24],
            "taw": [0.12, 0.20]
        },
        "liat": {
            "name": "Liat (Clay)",
            "fc": [0.32, 0.40],
            "wp": [0.20, 0.24],
            "taw": [0.12, 0.20]
        }
    }

    def calculate_eto_penman_monteith(self, t_min=None, t_max=None, humidity=70, wind_speed=2.0, pressure=101.3, altitude=0, latitude=-6.2, day_of_year=None, solar_rad=None, t_mean=None):
        """
        Implementation of the full FAO Penman-Monteith equation (FAO 56).
        Accepts optional solar_rad (Rs) and t_mean.
        """
        if day_of_year is None:
            day_of_year = datetime.datetime.now().timetuple().tm_yday

        if t_mean is None and (t_min is not None and t_max is not None):
            t_mean = (t_max + t_min) / 2
        elif t_mean is not None and (t_min is None or t_max is None):
            t_min = t_min if t_min is not None else t_mean - 2
            t_max = t_max if t_max is not None else t_mean + 2
        
        if t_mean is None:
            t_mean = 25.0 # Absolute fallback
        
        # 1. Slope of vapor pressure curve (Delta)
        delta = (4098 * (0.6108 * math.exp((17.27 * t_mean) / (t_mean + 237.3)))) / ((t_mean + 237.3)**2)
        
        # 2. Atmospheric Pressure (P) and Psychrometric constant (gamma)
        # If pressure not provided, estimate from altitude
        p = pressure if pressure else 101.3 * ((293 - 0.0065 * altitude) / 293)**5.26
        gamma = 0.000665 * p
        
        # 3. Vapor Pressure deficit (es - ea)
        if t_max is not None and t_min is not None:
            e_tmax = 0.6108 * math.exp((17.27 * t_max) / (t_max + 237.3))
            e_tmin = 0.6108 * math.exp((17.27 * t_min) / (t_min + 237.3))
            es = (e_tmax + e_tmin) / 2
        else:
            es = 0.6108 * math.exp((17.27 * t_mean) / (t_mean + 237.3))
            
        # Actual vapor pressure (ea) derived from humidity
        ea = (humidity / 100) * es # Simplified ea from mean RH
        vpd = es - ea
        
        # 4. Net Radiation (Rn) estimation if not measured
        # Using Hargreaves radiation formula for Rn estimation
        # Ra (Extraterrestrial radiation)
        # Ra (Extraterrestrial radiation)
        phi = (math.pi / 180) * latitude
        dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * day_of_year)
        sol_decl = 0.409 * math.sin(2 * math.pi / 365 * day_of_year - 1.39)
        sha = math.acos(-math.tan(phi) * math.tan(sol_decl))
        ra = (24 * 60 / math.pi) * 0.0820 * dr * (sha * math.sin(phi) * math.sin(sol_decl) + math.cos(phi) * math.cos(sol_decl) * math.sin(sha))
        
        # Rs (Solar radiation) 
        if solar_rad is not None:
            rs = solar_rad
        else:
            # Estimate from Tmax-Tmin if Rs not provided
            rs = 0.16 * math.sqrt(abs(t_max - t_min)) * ra 
            
        rns = (1 - 0.23) * rs # Net shortwave radiation (Albedo = 0.23)
        
        # Rnl (Net longwave radiation) - simplified 
        # Using clear sky radiation Rso
        rso = (0.75 + 2e-5 * altitude) * ra
        sigma = 4.903e-9 # Stefan-Boltzmann constant [MJ K-4 m-2 day-1]
        tk_max = t_max + 273.16
        tk_min = t_min + 273.16
        rnl = sigma * ((tk_max**4 + tk_min**4) / 2) * (0.34 - 0.14 * math.sqrt(ea)) * (1.35 * (rs/rso) - 0.35)
        
        rn = rns - rnl
        g = 0 # Soil heat flux (ignored for daily)
        
        # 5. Final Penman-Monteith Equation
        u2 = wind_speed if wind_speed else 2.0 # Default wind speed 2m/s
        
        num = 0.408 * delta * (rn - g) + gamma * (900 / (t_mean + 273)) * u2 * vpd
        den = delta + gamma * (1 + 0.34 * u2)
        
        eto = num / den
        return round(max(0.1, eto), 2)

    def get_kc_interpolated(self, crop_type, age_days):
        """
        Returns interpolated Kc based on growth stages (FAO 56).
        """
        crop = self.CROP_DATA.get(crop_type.lower())
        if not crop: return 1.0
        
        l_ini, l_veg, l_flow, l_mat = crop['stages']
        kc_ini, kc_veg, kc_flow, kc_mat = crop['kc']
        
        # Time markers
        t1 = l_ini
        t2 = l_ini + l_veg
        t3 = l_ini + l_veg + l_flow
        t_total = l_ini + l_veg + l_flow + l_mat
        
        if age_days <= t1:
            return kc_ini
        elif age_days <= t2:
            # Linear increase from initial to vegetative Kc
            return round(kc_ini + (age_days - t1) / l_veg * (kc_veg - kc_ini), 3)
        elif age_days <= t3:
            # Linear transition between vegetative and flowering (or constant if same)
            return round(kc_veg + (age_days - t2) / l_flow * (kc_flow - kc_veg), 3)
        elif age_days <= t_total:
            # Linear decrease during late stage (maturing)
            return round(kc_flow + (age_days - t3) / l_mat * (kc_mat - kc_flow), 3)
        else:
            return kc_mat # Harvest ready

    def calculate_seasonal_demand(self, crop_type, area_m2, eto_avg=4.0):
        """
        Projects total water requirement for an entire growing season.
        """
        crop = self.CROP_DATA.get(crop_type.lower())
        if not crop: return None
        
        total_days = sum(crop['stages'])
        daily_projection = []
        total_water = 0
        
        for day in range(1, total_days + 1):
            kc = self.get_kc_interpolated(crop_type, day)
            etc = eto_avg * kc
            water_liters = etc * area_m2
            
            total_water += water_liters
            # Sample every 5 days for the chart to keep it lightweight
            if day % 5 == 0 or day == 1 or day == total_days:
                daily_projection.append({
                    "day": day,
                    "kc": kc,
                    "water": round(water_liters, 1)
                })
                
        return {
            "total_days": total_days,
            "total_water_liters": round(total_water, 0),
            "avg_daily_liters": round(total_water / total_days, 1),
            "projection": daily_projection
        }

    def calculate_irrigation(self, crop_type, age_days, area_m2, t_min=None, t_max=None, humidity=70, wind_speed=2.0, pressure=101.3, solar_rad=None, t_mean=None):
        """
        Upgraded irrigation calculation using full Penman-Monteith.
        """
        eto = self.calculate_eto_penman_monteith(t_min, t_max, humidity, wind_speed, pressure, solar_rad=solar_rad, t_mean=t_mean)
        kc = self.get_kc_interpolated(crop_type, age_days)
        
        etc = eto * kc
        total_liters = etc * area_m2
        
        return {
            "eto": eto,
            "kc": kc,
            "etc": round(etc, 2),
            "water_liters": round(total_liters, 2),
            "unit": "Liters/day",
            "method": "FAO-56 Penman-Monteith"
        }

    def recommend_fertilizer(self, crop_type, area_m2):
        """Recommends fertilizer baseline in kg for a given area."""
        crop = self.CROP_DATA.get(crop_type.lower())
        if not crop:
            return None
            
        area_ha = area_m2 / 10000
        base_f = crop['fertilizer']
        
        return {
            "urea": round(base_f['urea'] * area_ha, 2),
            "sp36": round(base_f['sp36'] * area_ha, 2),
            "kcl": round(base_f['kcl'] * area_ha, 2),
            "unit": "kg"
        }

    def calculate_seasonal_water_demand(self, crop_type, area_m2, eto_avg=4.0):
        """
        Calculate total water requirement for entire growing season with phase breakdown.
        """
        crop = self.CROP_DATA.get(crop_type.lower())
        if not crop:
            return None
        
        stages = crop['stages']
        kc_values = crop['kc']
        
        phases = [
            {"name": "Inisial", "days": stages[0], "kc": kc_values[0]},
            {"name": "Vegetatif", "days": stages[1], "kc": kc_values[1]},
            {"name": "Pembungaan", "days": stages[2], "kc": kc_values[2]},
            {"name": "Pemasakan", "days": stages[3], "kc": kc_values[3]}
        ]
        
        total_water = 0
        phase_details = []
        
        for phase in phases:
            etc_avg = eto_avg * phase['kc']
            phase_water = etc_avg * area_m2 * phase['days']
            total_water += phase_water
            
            phase_details.append({
                "phase": phase['name'],
                "days": phase['days'],
                "kc": phase['kc'],
                "etc_avg": round(etc_avg, 2),
                "total_liters": round(phase_water, 0)
            })
        
        total_days = sum(stages)
        
        return {
            "crop_name": crop['name'],
            "total_days": total_days,
            "total_water_liters": round(total_water, 0),
            "total_water_m3": round(total_water / 1000, 2),
            "avg_daily_liters": round(total_water / total_days, 1),
            "area_m2": area_m2,
            "eto_avg_used": eto_avg,
            "phase_breakdown": phase_details
        }

agri_logic = AgriLogic()

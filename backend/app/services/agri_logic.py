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

    # Nutrient uptake per ton of yield (kg/ton) - Based on FAO/IRRI guidelines
    NUTRIENT_UPTAKE = {
        "padi": {
            "N": 15,      # kg N per ton grain
            "P2O5": 3,    # kg P2O5 per ton grain
            "K2O": 15,    # kg K2O per ton grain
            "typical_yield": 5.0  # ton/ha
        },
        "jagung": {
            "N": 18,
            "P2O5": 8,
            "K2O": 20,
            "typical_yield": 6.0
        },
        "cabai": {
            "N": 4,
            "P2O5": 1.5,
            "K2O": 5,
            "typical_yield": 15.0
        },
        "tomat": {
            "N": 3.5,
            "P2O5": 1.2,
            "K2O": 4.5,
            "typical_yield": 40.0
        },
        "bawang_merah": {
            "N": 3,
            "P2O5": 1,
            "K2O": 3.5,
            "typical_yield": 10.0
        },
        "kedelai": {
            "N": 60,  # Lower due to N-fixation
            "P2O5": 10,
            "K2O": 25,
            "typical_yield": 2.5
        }
    }

    # Fertilizer efficiency factors (% uptake by plants)
    FERTILIZER_EFFICIENCY = {
        "N": 0.60,   # 60% efficiency for nitrogen
        "P": 0.30,   # 30% efficiency for phosphorus
        "K": 0.50    # 50% efficiency for potassium
    }

    # Fertilizer composition (%) and default prices (Rp/kg)
    FERTILIZER_COMPOSITION = {
        # Single nutrient fertilizers
        "urea": {"N": 46, "price_per_kg": 2500},
        "za": {"N": 21, "S": 24, "price_per_kg": 1800},
        "sp36": {"P2O5": 36, "price_per_kg": 2200},
        "tsp": {"P2O5": 46, "price_per_kg": 3000},
        "kcl": {"K2O": 60, "price_per_kg": 3500},
        
        # Compound fertilizers (NPK)
        "npk_phonska": {"N": 15, "P2O5": 15, "K2O": 15, "price_per_kg": 2800},
        "npk_16_16_16": {"N": 16, "P2O5": 16, "K2O": 16, "price_per_kg": 3200},
        "npk_mutiara": {"N": 16, "P2O5": 16, "K2O": 16, "S": 2, "price_per_kg": 3500},
        "npk_pelangi": {"N": 15, "P2O5": 15, "K2O": 15, "S": 10, "price_per_kg": 3000},
        
        # Organic options
        "kompos": {"N": 1.5, "P2O5": 1, "K2O": 1.5, "price_per_kg": 500},
        "pupuk_kandang": {"N": 0.5, "P2O5": 0.3, "K2O": 0.5, "price_per_kg": 300}
    }

    # Fertilizer compatibility matrix (can they be mixed safely?)
    FERTILIZER_COMPATIBILITY = {
        ("urea", "sp36"): True,
        ("urea", "tsp"): True,
        ("urea", "kcl"): True,
        ("urea", "za"): False,  # Can cause nitrogen loss through volatilization
        ("urea", "npk_phonska"): True,
        ("za", "sp36"): True,
        ("za", "tsp"): True,
        ("za", "kcl"): True,
        ("sp36", "kcl"): True,
        ("tsp", "kcl"): True,
        ("npk_phonska", "urea"): True,
        ("npk_phonska", "kcl"): True,
        # Organic fertilizers can be mixed with anything
        ("kompos", "urea"): True,
        ("kompos", "sp36"): True,
        ("kompos", "kcl"): True,
        ("pupuk_kandang", "urea"): True,
        ("pupuk_kandang", "sp36"): True,
        ("pupuk_kandang", "kcl"): True
    }

    # Application timing by growth phase (% of total)
    FERTILIZER_TIMING = {
        "padi": {
            "basal": 0.30,      # 30% at planting
            "susulan_1": 0.35,  # 35% at 21 DAP (tillering)
            "susulan_2": 0.35,  # 35% at 42 DAP (panicle initiation)
            "days": [0, 21, 42]
        },
        "jagung": {
            "basal": 0.40,
            "susulan_1": 0.30,  # 30 DAP
            "susulan_2": 0.30,  # 45 DAP
            "days": [0, 30, 45]
        },
        "cabai": {
            "basal": 0.25,
            "susulan_1": 0.35,  # 21 DAP
            "susulan_2": 0.40,  # 45 DAP
            "days": [0, 21, 45]
        },
        "tomat": {
            "basal": 0.30,
            "susulan_1": 0.35,  # 25 DAP
            "susulan_2": 0.35,  # 50 DAP
            "days": [0, 25, 50]
        },
        "bawang_merah": {
            "basal": 0.40,
            "susulan_1": 0.30,  # 15 DAP
            "susulan_2": 0.30,  # 30 DAP
            "days": [0, 15, 30]
        },
        "kedelai": {
            "basal": 0.50,
            "susulan_1": 0.50,  # 30 DAP
            "susulan_2": 0.00,  # No third application
            "days": [0, 30, 0]
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

    def calculate_irrigation(self, crop_type, age_days, area_m2, t_min=None, t_max=None, humidity=70, wind_speed=2.0, pressure=101.3, solar_rad=None, t_mean=None, rainfall=0):
        """
        Upgraded irrigation calculation using full Penman-Monteith.
        Includes rainfall consideration for net irrigation requirement.
        
        Args:
            rainfall: Daily rainfall in mm/day
        """
        eto = self.calculate_eto_penman_monteith(t_min, t_max, humidity, wind_speed, pressure, solar_rad=solar_rad, t_mean=t_mean)
        kc = self.get_kc_interpolated(crop_type, age_days)
        
        etc = eto * kc
        
        # Calculate effective rainfall (80% efficiency as per FAO guidelines)
        effective_rainfall = rainfall * 0.8
        
        # Net irrigation requirement (cannot be negative)
        net_etc = max(0, etc - effective_rainfall)
        
        # Calculate water volumes
        total_liters = etc * area_m2
        net_liters = net_etc * area_m2
        
        return {
            "eto": eto,
            "kc": kc,
            "etc": round(etc, 2),
            "rainfall": round(rainfall, 2),
            "effective_rainfall": round(effective_rainfall, 2),
            "net_etc": round(net_etc, 2),
            "water_liters": round(total_liters, 2),
            "net_water_liters": round(net_liters, 2),
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

    def calculate_fertilizer_scientific(self, crop_type, area_m2, 
                                       target_yield=None,
                                       soil_n_percent=None,
                                       soil_p_ppm=None, 
                                       soil_k_me=None,
                                       soil_ph=6.5,
                                       organic_matter_percent=2.0):
        """
        Scientific fertilizer recommendation based on nutrient balance.
        
        Args:
            crop_type: Crop identifier
            area_m2: Field area in m²
            target_yield: Target yield in ton/ha (optional, uses typical if None)
            soil_n_percent: Soil N-total (%)
            soil_p_ppm: Soil P-available (ppm Olsen/Bray)
            soil_k_me: Soil K-exchangeable (me/100g)
            soil_ph: Soil pH
            organic_matter_percent: Organic matter content (%)
        
        Returns:
            Detailed fertilizer recommendation with phase breakdown
        """
        
        crop = self.CROP_DATA.get(crop_type.lower())
        nutrient_data = self.NUTRIENT_UPTAKE.get(crop_type.lower())
        
        if not crop or not nutrient_data:
            return None
        
        area_ha = area_m2 / 10000
        
        # 1. Determine target yield
        if target_yield is None:
            target_yield = nutrient_data['typical_yield']
        
        # 2. Calculate crop nutrient requirement (kg/ha)
        N_requirement = target_yield * nutrient_data['N']
        P_requirement = target_yield * nutrient_data['P2O5']
        K_requirement = target_yield * nutrient_data['K2O']
        
        # 3. Calculate soil nutrient supply (kg/ha)
        N_soil = self._calculate_soil_n_supply(soil_n_percent, organic_matter_percent)
        P_soil = self._interpret_soil_p(soil_p_ppm)
        K_soil = self._interpret_soil_k(soil_k_me)
        
        # 4. Net nutrient need (kg/ha)
        N_net = max(0, N_requirement - N_soil)
        P_net = max(0, P_requirement - P_soil)
        K_net = max(0, K_requirement - K_soil)
        
        # 5. Account for fertilizer efficiency
        N_fertilizer = N_net / self.FERTILIZER_EFFICIENCY['N']
        P_fertilizer = P_net / self.FERTILIZER_EFFICIENCY['P']
        K_fertilizer = K_net / self.FERTILIZER_EFFICIENCY['K']
        
        # 6. Convert to actual fertilizer products (kg/ha)
        urea_kg = N_fertilizer / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100)
        sp36_kg = P_fertilizer / (self.FERTILIZER_COMPOSITION['sp36']['P2O5'] / 100)
        kcl_kg = K_fertilizer / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100)
        
        # 7. Scale to actual area
        urea_total = urea_kg * area_ha
        sp36_total = sp36_kg * area_ha
        kcl_total = kcl_kg * area_ha
        
        # 8. Split by growth phase
        phases = self._distribute_by_phase(crop_type, urea_total, sp36_total, kcl_total)
        
        # 9. Calculate total cost
        total_cost = (
            urea_total * self.FERTILIZER_COMPOSITION['urea']['price_per_kg'] +
            sp36_total * self.FERTILIZER_COMPOSITION['sp36']['price_per_kg'] +
            kcl_total * self.FERTILIZER_COMPOSITION['kcl']['price_per_kg']
        )
        
        return {
            "crop_name": crop['name'],
            "target_yield_ton_ha": target_yield,
            "area_ha": round(area_ha, 2),
            "area_m2": area_m2,
            "nutrient_requirement": {
                "N": round(N_requirement, 2),
                "P2O5": round(P_requirement, 2),
                "K2O": round(K_requirement, 2)
            },
            "soil_supply": {
                "N": round(N_soil, 2),
                "P2O5": round(P_soil, 2),
                "K2O": round(K_soil, 2)
            },
            "net_need": {
                "N": round(N_net, 2),
                "P2O5": round(P_net, 2),
                "K2O": round(K_net, 2)
            },
            "fertilizer_total_kg": {
                "urea": round(urea_total, 2),
                "sp36": round(sp36_total, 2),
                "kcl": round(kcl_total, 2)
            },
            "total_cost_idr": round(total_cost, 0),
            "application_schedule": phases,
            "method": "Nutrient Balance (FAO/IRRI)"
        }
    
    def _calculate_soil_n_supply(self, n_percent, om_percent):
        """Calculate N supply from soil and organic matter mineralization"""
        if n_percent is None:
            n_percent = 0.15  # Default medium fertility
        
        # N from soil organic matter (assumes 20cm depth, 1.3 g/cm³ bulk density)
        # Formula: N% × depth(cm) × bulk_density(g/cm³) × 10 = kg N/ha
        soil_n = n_percent * 20 * 1.3 * 10  # kg/ha
        
        # Additional N from OM mineralization (2% per year)
        om_n = om_percent * 0.02 * 20 * 1.3 * 10
        
        return soil_n + om_n
    
    def _interpret_soil_p(self, p_ppm):
        """Interpret P availability from soil test (Olsen/Bray method)"""
        if p_ppm is None:
            return 0  # Assume low if not tested
        
        # Olsen/Bray interpretation for P contribution
        if p_ppm < 10:
            return 0  # Very low - no contribution
        elif p_ppm < 15:
            return 5  # Low - minimal contribution
        elif p_ppm < 25:
            return 10  # Medium - moderate contribution
        else:
            return 15  # High - good contribution
    
    def _interpret_soil_k(self, k_me):
        """Interpret K availability from soil test (me/100g)"""
        if k_me is None:
            return 0  # Assume low if not tested
        
        # me/100g interpretation for K contribution
        if k_me < 0.2:
            return 0  # Very low
        elif k_me < 0.4:
            return 20  # Low
        elif k_me < 0.6:
            return 40  # Medium
        else:
            return 60  # High
    
    def _distribute_by_phase(self, crop_type, urea, sp36, kcl):
        """Distribute fertilizer by growth phase"""
        timing = self.FERTILIZER_TIMING.get(crop_type.lower(), {
            "basal": 0.40, 
            "susulan_1": 0.30, 
            "susulan_2": 0.30,
            "days": [0, 21, 42]
        })
        
        return [
            {
                "phase": "Dasar (Basal)",
                "day": timing['days'][0],
                "urea_kg": round(urea * timing['basal'], 2),
                "sp36_kg": round(sp36, 2),  # All P at planting
                "kcl_kg": round(kcl * timing['basal'], 2)
            },
            {
                "phase": "Susulan 1",
                "day": timing['days'][1],
                "urea_kg": round(urea * timing['susulan_1'], 2),
                "sp36_kg": 0,  # No P in follow-up
                "kcl_kg": round(kcl * timing['susulan_1'], 2)
            },
            {
                "phase": "Susulan 2",
                "day": timing['days'][2],
                "urea_kg": round(urea * timing['susulan_2'], 2),
                "sp36_kg": 0,
                "kcl_kg": round(kcl * timing['susulan_2'], 2)
            }
        ]

    def calculate_fertilizer_multi_option(self, crop_type, area_m2,
                                          target_yield=None,
                                          soil_n_percent=None,
                                          soil_p_ppm=None,
                                          soil_k_me=None,
                                          soil_ph=6.5,
                                          organic_matter_percent=2.0,
                                          max_options=5):
        """
        Generate multiple fertilizer combination options with scoring and ranking.
        
        Returns:
            List of fertilizer options ranked by score (0-100) and cost
        """
        
        crop = self.CROP_DATA.get(crop_type.lower())
        nutrient_data = self.NUTRIENT_UPTAKE.get(crop_type.lower())
        
        if not crop or not nutrient_data:
            return None
        
        area_ha = area_m2 / 10000
        
        # 1. Calculate nutrient requirements (same as scientific method)
        if target_yield is None:
            target_yield = nutrient_data['typical_yield']
        
        N_requirement = target_yield * nutrient_data['N']
        P_requirement = target_yield * nutrient_data['P2O5']
        K_requirement = target_yield * nutrient_data['K2O']
        
        # 2. Calculate soil supply
        N_soil = self._calculate_soil_n_supply(soil_n_percent, organic_matter_percent)
        P_soil = self._interpret_soil_p(soil_p_ppm)
        K_soil = self._interpret_soil_k(soil_k_me)
        
        # 3. Net nutrient need
        N_net = max(0, N_requirement - N_soil) / self.FERTILIZER_EFFICIENCY['N']
        P_net = max(0, P_requirement - P_soil) / self.FERTILIZER_EFFICIENCY['P']
        K_net = max(0, K_requirement - K_soil) / self.FERTILIZER_EFFICIENCY['K']
        
        # 4. Generate fertilizer combinations
        combinations = []
        
        # Option 1: Single fertilizers (Urea + SP-36 + KCl) - Baseline
        combinations.append({
            'name': 'Pupuk Tunggal (Urea + SP-36 + KCl)',
            'fertilizers': {
                'urea': N_net / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100) * area_ha,
                'sp36': P_net / (self.FERTILIZER_COMPOSITION['sp36']['P2O5'] / 100) * area_ha,
                'kcl': K_net / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100) * area_ha
            }
        })
        
        # Option 2: NPK Phonska + supplements
        npk_phonska_for_p = P_net / (self.FERTILIZER_COMPOSITION['npk_phonska']['P2O5'] / 100)
        n_from_phonska = npk_phonska_for_p * (self.FERTILIZER_COMPOSITION['npk_phonska']['N'] / 100)
        k_from_phonska = npk_phonska_for_p * (self.FERTILIZER_COMPOSITION['npk_phonska']['K2O'] / 100)
        
        combinations.append({
            'name': 'NPK Phonska + Urea + KCl',
            'fertilizers': {
                'npk_phonska': npk_phonska_for_p * area_ha,
                'urea': max(0, (N_net - n_from_phonska) / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100)) * area_ha,
                'kcl': max(0, (K_net - k_from_phonska) / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100)) * area_ha
            }
        })
        
        # Option 3: NPK 16-16-16 + supplements
        npk_16_for_p = P_net / (self.FERTILIZER_COMPOSITION['npk_16_16_16']['P2O5'] / 100)
        n_from_16 = npk_16_for_p * (self.FERTILIZER_COMPOSITION['npk_16_16_16']['N'] / 100)
        k_from_16 = npk_16_for_p * (self.FERTILIZER_COMPOSITION['npk_16_16_16']['K2O'] / 100)
        
        combinations.append({
            'name': 'NPK 16-16-16 + Urea + KCl',
            'fertilizers': {
                'npk_16_16_16': npk_16_for_p * area_ha,
                'urea': max(0, (N_net - n_from_16) / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100)) * area_ha,
                'kcl': max(0, (K_net - k_from_16) / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100)) * area_ha
            }
        })
        
        # Option 4: NPK Mutiara + supplements
        combinations.append({
            'name': 'NPK Mutiara + Urea + KCl',
            'fertilizers': {
                'npk_mutiara': npk_16_for_p * area_ha,  # Same ratio as 16-16-16
                'urea': max(0, (N_net - n_from_16) / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100)) * area_ha,
                'kcl': max(0, (K_net - k_from_16) / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100)) * area_ha
            }
        })
        
        # Option 5: ZA instead of Urea (for acidic soils)
        combinations.append({
            'name': 'ZA + SP-36 + KCl (Tanah Masam)',
            'fertilizers': {
                'za': N_net / (self.FERTILIZER_COMPOSITION['za']['N'] / 100) * area_ha,
                'sp36': P_net / (self.FERTILIZER_COMPOSITION['sp36']['P2O5'] / 100) * area_ha,
                'kcl': K_net / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100) * area_ha
            }
        })
        
        # Option 6: With organic base
        organic_base_kg = 500 * area_ha  # 500 kg/ha kompos
        n_from_organic = organic_base_kg * (self.FERTILIZER_COMPOSITION['kompos']['N'] / 100)
        p_from_organic = organic_base_kg * (self.FERTILIZER_COMPOSITION['kompos']['P2O5'] / 100)
        k_from_organic = organic_base_kg * (self.FERTILIZER_COMPOSITION['kompos']['K2O'] / 100)
        
        combinations.append({
            'name': 'Kompos + Urea + SP-36 + KCl',
            'fertilizers': {
                'kompos': organic_base_kg,
                'urea': max(0, (N_net - n_from_organic) / (self.FERTILIZER_COMPOSITION['urea']['N'] / 100)) * area_ha,
                'sp36': max(0, (P_net - p_from_organic) / (self.FERTILIZER_COMPOSITION['sp36']['P2O5'] / 100)) * area_ha,
                'kcl': max(0, (K_net - k_from_organic) / (self.FERTILIZER_COMPOSITION['kcl']['K2O'] / 100)) * area_ha
            }
        })
        
        # 5. Score and rank each combination
        scored_options = []
        for combo in combinations:
            score_result = self._score_fertilizer_combination(
                combo['fertilizers'],
                N_requirement * area_ha,
                P_requirement * area_ha,
                K_requirement * area_ha
            )
            
            # Calculate total cost
            total_cost = sum(
                amount * self.FERTILIZER_COMPOSITION[fert]['price_per_kg']
                for fert, amount in combo['fertilizers'].items()
                if amount > 0
            )
            
            # Check compatibility
            compatibility = self._check_compatibility(list(combo['fertilizers'].keys()))
            
            scored_options.append({
                'name': combo['name'],
                'fertilizers': {k: round(v, 2) for k, v in combo['fertilizers'].items() if v > 0.1},
                'score': score_result['score'],
                'total_cost': round(total_cost, 0),
                'nutrient_supplied': score_result['supplied'],
                'warnings': score_result['warnings'],
                'compatible': compatibility['compatible'],
                'compatibility_note': compatibility.get('note', '')
            })
        
        # 6. Sort by score (descending) then cost (ascending)
        scored_options.sort(key=lambda x: (-x['score'], x['total_cost']))
        
        # 7. Return top options
        return {
            'crop_name': crop['name'],
            'target_yield_ton_ha': target_yield,
            'area_ha': round(area_ha, 2),
            'nutrient_requirement': {
                'N': round(N_requirement * area_ha, 2),
                'P2O5': round(P_requirement * area_ha, 2),
                'K2O': round(K_requirement * area_ha, 2)
            },
            'options': scored_options[:max_options],
            'method': 'Multi-Fertilizer Optimization'
        }
    
    def _score_fertilizer_combination(self, fertilizers, n_target, p_target, k_target):
        """
        Score a fertilizer combination based on nutrient balance accuracy.
        Score: 0-100 (100 = perfect match)
        """
        
        # Calculate nutrients supplied
        n_supplied = sum(
            amount * (self.FERTILIZER_COMPOSITION[fert].get('N', 0) / 100)
            for fert, amount in fertilizers.items()
        )
        p_supplied = sum(
            amount * (self.FERTILIZER_COMPOSITION[fert].get('P2O5', 0) / 100)
            for fert, amount in fertilizers.items()
        )
        k_supplied = sum(
            amount * (self.FERTILIZER_COMPOSITION[fert].get('K2O', 0) / 100)
            for fert, amount in fertilizers.items()
        )
        
        # Calculate deviations
        n_dev = abs(n_supplied - n_target) / n_target if n_target > 0 else 0
        p_dev = abs(p_supplied - p_target) / p_target if p_target > 0 else 0
        k_dev = abs(k_supplied - k_target) / k_target if k_target > 0 else 0
        
        # Start with perfect score
        score = 100
        warnings = []
        
        # Deduct points for N deviation
        if n_dev > 0.10:  # >10% deviation
            score -= 20
            if n_supplied < n_target * 0.90:
                warnings.append(f'⚠️ N kurang {abs(n_dev)*100:.1f}% dari kebutuhan')
            else:
                warnings.append(f'⚠️ N berlebih {abs(n_dev)*100:.1f}%')
        
        # Deduct points for P deviation
        if p_dev > 0.10:
            score -= 15
            if p_supplied > p_target * 1.20:  # Over-fertilization more serious for P
                warnings.append(f'⚠️ P berlebih {abs(p_dev)*100:.1f}% (risiko pencemaran)')
        
        # Deduct points for K deviation
        if k_dev > 0.10:
            score -= 15
            if k_supplied < k_target * 0.90:
                warnings.append(f'⚠️ K kurang {abs(k_dev)*100:.1f}%')
        
        # Bonus for balanced NPK ratio
        if n_dev < 0.05 and p_dev < 0.05 and k_dev < 0.05:
            score += 10  # Excellent balance bonus
        
        return {
            'score': max(0, min(100, score)),  # Clamp to 0-100
            'supplied': {
                'N': round(n_supplied, 2),
                'P2O5': round(p_supplied, 2),
                'K2O': round(k_supplied, 2)
            },
            'warnings': warnings
        }
    
    def _check_compatibility(self, fertilizer_list):
        """Check if fertilizers in the list are compatible for mixing"""
        
        if len(fertilizer_list) <= 1:
            return {'compatible': True}
        
        # Check all pairs
        for i in range(len(fertilizer_list)):
            for j in range(i + 1, len(fertilizer_list)):
                fert1, fert2 = sorted([fertilizer_list[i], fertilizer_list[j]])
                
                # Check in compatibility matrix
                is_compatible = self.FERTILIZER_COMPATIBILITY.get((fert1, fert2), True)
                
                if not is_compatible:
                    return {
                        'compatible': False,
                        'note': f'⚠️ {fert1.upper()} dan {fert2.upper()} tidak boleh dicampur (risiko kehilangan nitrogen)'
                    }
        
        return {'compatible': True}

agri_logic = AgriLogic()

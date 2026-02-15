"""
Test script untuk memverifikasi perhitungan rainfall dan net water requirement
Test 3: Calculation with Rainfall
"""
import sys
sys.path.insert(0, 'backend/app/services')

from agri_logic import agri_logic

print("=" * 60)
print("TEST 3: Calculation with Rainfall (5 mm/day)")
print("=" * 60)

# Test parameters
crop_type = 'padi'
age_days = 30
area_m2 = 1000
t_mean = 27.0
humidity = 75
wind_speed = 1.5
pressure = 101.3
solar_rad = 15.0
rainfall = 5.0  # KEY TEST VALUE

print(f"\nInput Parameters:")
print(f"  Crop: {crop_type.capitalize()}")
print(f"  Age: {age_days} days")
print(f"  Area: {area_m2} m²")
print(f"  Temperature: {t_mean}°C")
print(f"  Humidity: {humidity}%")
print(f"  Wind Speed: {wind_speed} m/s")
print(f"  Pressure: {pressure} hPa")
print(f"  Solar Radiation: {solar_rad}")
print(f"  Rainfall: {rainfall} mm/day ⭐ KEY TEST VALUE")

# Calculate
result = agri_logic.calculate_irrigation(
    crop_type=crop_type,
    age_days=age_days,
    area_m2=area_m2,
    t_mean=t_mean,
    humidity=humidity,
    wind_speed=wind_speed,
    pressure=pressure,
    solar_rad=solar_rad,
    rainfall=rainfall
)

print(f"\n{'=' * 60}")
print("RESULTS:")
print("=" * 60)
print(f"\n1. Basic Calculations:")
print(f"   ETo: {result['eto']} mm/day")
print(f"   Kc: {result['kc']}")
print(f"   ETc (Gross): {result['etc']} mm/day")

print(f"\n2. Rainfall Calculations:")
print(f"   Rainfall Input: {result['rainfall']} mm/day")
print(f"   Effective Rainfall (80%): {result['effective_rainfall']} mm/day")
print(f"   Expected: {rainfall * 0.8} mm/day")
print(f"   ✓ PASS" if result['effective_rainfall'] == round(rainfall * 0.8, 2) else "   ✗ FAIL")

print(f"\n3. Net Irrigation Requirement:")
print(f"   Net ETc: {result['net_etc']} mm/day")
print(f"   Expected: max(0, {result['etc']} - {result['effective_rainfall']}) = {max(0, result['etc'] - result['effective_rainfall'])}")
print(f"   ✓ PASS" if result['net_etc'] == round(max(0, result['etc'] - result['effective_rainfall']), 2) else "   ✗ FAIL")

print(f"\n4. Water Volume Calculations:")
print(f"   Gross Water Requirement: {result['water_liters']:,.2f} L/day")
print(f"   Net Water Requirement: {result['net_water_liters']:,.2f} L/day")
print(f"   Difference: {result['water_liters'] - result['net_water_liters']:,.2f} L/day")

print(f"\n5. Verification Checks:")
print(f"   ✓ Effective rainfall = 80% of input: {result['effective_rainfall'] == round(rainfall * 0.8, 2)}")
print(f"   ✓ Net ETc < Gross ETc: {result['net_etc'] < result['etc']}")
print(f"   ✓ Net water < Gross water: {result['net_water_liters'] < result['water_liters']}")
print(f"   ✓ Net ETc is non-negative: {result['net_etc'] >= 0}")

print(f"\n{'=' * 60}")
print("TEST 3 SUMMARY:")
print("=" * 60)

all_checks = [
    result['effective_rainfall'] == round(rainfall * 0.8, 2),
    result['net_etc'] < result['etc'],
    result['net_water_liters'] < result['water_liters'],
    result['net_etc'] >= 0,
    result['net_etc'] == round(max(0, result['etc'] - result['effective_rainfall']), 2)
]

if all(all_checks):
    print("✅ ALL TESTS PASSED!")
    print("   - Effective rainfall calculated correctly (80% efficiency)")
    print("   - Net irrigation requirement is less than gross requirement")
    print("   - All values are non-negative")
    print("   - Calculations are mathematically correct")
else:
    print("❌ SOME TESTS FAILED!")
    print("   Please review the calculations above")

print("=" * 60)

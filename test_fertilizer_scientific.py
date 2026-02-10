"""
Test script for scientific fertilizer calculation
Verifies nutrient balance method implementation
"""
import sys
sys.path.insert(0, 'backend/app/services')

from agri_logic import agri_logic

print("=" * 70)
print("SCIENTIFIC FERTILIZER CALCULATION TEST")
print("=" * 70)

# Test Case 1: Padi with medium soil fertility
print("\n" + "=" * 70)
print("TEST 1: Padi - Medium Soil Fertility")
print("=" * 70)

result1 = agri_logic.calculate_fertilizer_scientific(
    crop_type='padi',
    area_m2=10000,  # 1 hectare
    target_yield=6.0,  # ton/ha
    soil_n_percent=0.15,  # Medium
    soil_p_ppm=12,  # Low-medium
    soil_k_me=0.3,  # Medium
    organic_matter_percent=2.0
)

print(f"\nCrop: {result1['crop_name']}")
print(f"Target Yield: {result1['target_yield_ton_ha']} ton/ha")
print(f"Area: {result1['area_ha']} ha ({result1['area_m2']} m²)")

print(f"\n📊 NUTRIENT REQUIREMENT (kg/ha):")
print(f"  N  : {result1['nutrient_requirement']['N']} kg")
print(f"  P₂O₅: {result1['nutrient_requirement']['P2O5']} kg")
print(f"  K₂O: {result1['nutrient_requirement']['K2O']} kg")

print(f"\n🌱 SOIL SUPPLY (kg/ha):")
print(f"  N  : {result1['soil_supply']['N']} kg")
print(f"  P₂O₅: {result1['soil_supply']['P2O5']} kg")
print(f"  K₂O: {result1['soil_supply']['K2O']} kg")

print(f"\n⚖️  NET NEED (kg/ha):")
print(f"  N  : {result1['net_need']['N']} kg")
print(f"  P₂O₅: {result1['net_need']['P2O5']} kg")
print(f"  K₂O: {result1['net_need']['K2O']} kg")

print(f"\n💰 FERTILIZER RECOMMENDATION:")
print(f"  Urea  : {result1['fertilizer_total_kg']['urea']} kg")
print(f"  SP-36 : {result1['fertilizer_total_kg']['sp36']} kg")
print(f"  KCl   : {result1['fertilizer_total_kg']['kcl']} kg")
print(f"  TOTAL COST: Rp {result1['total_cost_idr']:,.0f}")

print(f"\n📅 APPLICATION SCHEDULE:")
for phase in result1['application_schedule']:
    print(f"\n  {phase['phase']} (Day {phase['day']}):")
    print(f"    Urea  : {phase['urea_kg']} kg")
    print(f"    SP-36 : {phase['sp36_kg']} kg")
    print(f"    KCl   : {phase['kcl_kg']} kg")

# Test Case 2: Jagung with low soil fertility
print("\n" + "=" * 70)
print("TEST 2: Jagung - Low Soil Fertility")
print("=" * 70)

result2 = agri_logic.calculate_fertilizer_scientific(
    crop_type='jagung',
    area_m2=5000,  # 0.5 hectare
    target_yield=7.0,  # ton/ha (higher than typical)
    soil_n_percent=0.10,  # Low
    soil_p_ppm=8,  # Very low
    soil_k_me=0.15,  # Very low
    organic_matter_percent=1.5
)

print(f"\nCrop: {result2['crop_name']}")
print(f"Target Yield: {result2['target_yield_ton_ha']} ton/ha (Above typical!)")
print(f"Area: {result2['area_ha']} ha")

print(f"\n💰 FERTILIZER RECOMMENDATION:")
print(f"  Urea  : {result2['fertilizer_total_kg']['urea']} kg")
print(f"  SP-36 : {result2['fertilizer_total_kg']['sp36']} kg")
print(f"  KCl   : {result2['fertilizer_total_kg']['kcl']} kg")
print(f"  TOTAL COST: Rp {result2['total_cost_idr']:,.0f}")

# Test Case 3: Cabai with no soil data (defaults)
print("\n" + "=" * 70)
print("TEST 3: Cabai - No Soil Test Data (Conservative Approach)")
print("=" * 70)

result3 = agri_logic.calculate_fertilizer_scientific(
    crop_type='cabai',
    area_m2=2000,  # 0.2 hectare
    # No soil data - will use defaults
)

print(f"\nCrop: {result3['crop_name']}")
print(f"Target Yield: {result3['target_yield_ton_ha']} ton/ha (Typical)")
print(f"Area: {result3['area_ha']} ha")

print(f"\n⚠️  NOTE: No soil test data provided - using conservative assumptions")
print(f"  Soil N assumed: {result3['soil_supply']['N']} kg/ha")
print(f"  Soil P assumed: {result3['soil_supply']['P2O5']} kg/ha (very low)")
print(f"  Soil K assumed: {result3['soil_supply']['K2O']} kg/ha (very low)")

print(f"\n💰 FERTILIZER RECOMMENDATION:")
print(f"  Urea  : {result3['fertilizer_total_kg']['urea']} kg")
print(f"  SP-36 : {result3['fertilizer_total_kg']['sp36']} kg")
print(f"  KCl   : {result3['fertilizer_total_kg']['kcl']} kg")
print(f"  TOTAL COST: Rp {result3['total_cost_idr']:,.0f}")

# Verification checks
print("\n" + "=" * 70)
print("VERIFICATION CHECKS")
print("=" * 70)

checks_passed = 0
total_checks = 0

# Check 1: Nutrient balance equation
total_checks += 1
n_balance_ok = abs(result1['net_need']['N'] - (result1['nutrient_requirement']['N'] - result1['soil_supply']['N'])) < 0.1
if n_balance_ok:
    checks_passed += 1
    print("✓ Nutrient balance equation correct")
else:
    print("✗ Nutrient balance equation FAILED")

# Check 2: Fertilizer efficiency applied
total_checks += 1
expected_urea = result1['net_need']['N'] / 0.60 / 0.46 * result1['area_ha']
urea_ok = abs(result1['fertilizer_total_kg']['urea'] - expected_urea) < 1
if urea_ok:
    checks_passed += 1
    print("✓ Fertilizer efficiency correctly applied")
else:
    print(f"✗ Fertilizer efficiency FAILED (expected {expected_urea:.1f}, got {result1['fertilizer_total_kg']['urea']})")

# Check 3: Phase distribution sums to 100%
total_checks += 1
total_urea_phases = sum(p['urea_kg'] for p in result1['application_schedule'])
phase_ok = abs(total_urea_phases - result1['fertilizer_total_kg']['urea']) < 0.1
if phase_ok:
    checks_passed += 1
    print("✓ Phase distribution sums correctly")
else:
    print("✗ Phase distribution FAILED")

# Check 4: All P at basal
total_checks += 1
all_p_basal = (result1['application_schedule'][0]['sp36_kg'] == result1['fertilizer_total_kg']['sp36'] and
               result1['application_schedule'][1]['sp36_kg'] == 0 and
               result1['application_schedule'][2]['sp36_kg'] == 0)
if all_p_basal:
    checks_passed += 1
    print("✓ All phosphorus applied at basal (correct practice)")
else:
    print("✗ Phosphorus distribution FAILED")

# Check 5: Cost calculation
total_checks += 1
expected_cost = (
    result1['fertilizer_total_kg']['urea'] * 2500 +
    result1['fertilizer_total_kg']['sp36'] * 2200 +
    result1['fertilizer_total_kg']['kcl'] * 3500
)
cost_ok = abs(result1['total_cost_idr'] - expected_cost) < 1
if cost_ok:
    checks_passed += 1
    print("✓ Cost calculation correct")
else:
    print("✗ Cost calculation FAILED")

print(f"\n{'=' * 70}")
print(f"SUMMARY: {checks_passed}/{total_checks} checks passed")
if checks_passed == total_checks:
    print("✅ ALL TESTS PASSED!")
else:
    print(f"⚠️  {total_checks - checks_passed} test(s) failed")
print("=" * 70)

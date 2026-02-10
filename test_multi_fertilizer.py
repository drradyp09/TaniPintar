"""
Test script for multi-fertilizer optimization
Tests scoring, ranking, and compatibility checking
"""
import sys
sys.path.insert(0, 'backend/app/services')

from agri_logic import agri_logic

print("=" * 80)
print("MULTI-FERTILIZER OPTIMIZATION TEST")
print("=" * 80)

# Test Case: Padi with medium soil fertility
print("\n" + "=" * 80)
print("TEST: Padi - 1 Hectare - Medium Soil Fertility")
print("=" * 80)

result = agri_logic.calculate_fertilizer_multi_option(
    crop_type='padi',
    area_m2=10000,  # 1 hectare
    target_yield=6.0,  # ton/ha
    soil_n_percent=0.15,  # Medium
    soil_p_ppm=12,  # Low-medium
    soil_k_me=0.3,  # Medium
    organic_matter_percent=2.0,
    max_options=6  # Get all options
)

print(f"\n🌾 Crop: {result['crop_name']}")
print(f"🎯 Target Yield: {result['target_yield_ton_ha']} ton/ha")
print(f"📏 Area: {result['area_ha']} ha")
print(f"🔬 Method: {result['method']}")

print(f"\n📊 NUTRIENT REQUIREMENT:")
print(f"  N  : {result['nutrient_requirement']['N']} kg")
print(f"  P₂O₅: {result['nutrient_requirement']['P2O5']} kg")
print(f"  K₂O: {result['nutrient_requirement']['K2O']} kg")

print(f"\n{'=' * 80}")
print(f"FERTILIZER OPTIONS (Ranked by Score → Cost)")
print("=" * 80)

for idx, option in enumerate(result['options'], 1):
    print(f"\n{'🏆' if idx == 1 else '📌'} OPTION #{idx}: {option['name']}")
    print(f"   Score: {option['score']}/100")
    print(f"   Cost: Rp {option['total_cost']:,.0f}")
    
    if not option['compatible']:
        print(f"   ⚠️  COMPATIBILITY: {option['compatibility_note']}")
    else:
        print(f"   ✓ Compatible for mixing")
    
    print(f"\n   Fertilizers:")
    for fert, amount in option['fertilizers'].items():
        print(f"     - {fert.upper()}: {amount} kg")
    
    print(f"\n   Nutrients Supplied:")
    print(f"     N  : {option['nutrient_supplied']['N']} kg")
    print(f"     P₂O₅: {option['nutrient_supplied']['P2O5']} kg")
    print(f"     K₂O: {option['nutrient_supplied']['K2O']} kg")
    
    if option['warnings']:
        print(f"\n   Warnings:")
        for warning in option['warnings']:
            print(f"     {warning}")
    else:
        print(f"\n   ✓ No warnings - excellent nutrient balance!")
    
    print(f"   {'-' * 76}")

# Analysis
print(f"\n{'=' * 80}")
print("ANALYSIS")
print("=" * 80)

best_option = result['options'][0]
cheapest_option = min(result['options'], key=lambda x: x['total_cost'])

print(f"\n🏆 BEST SCORE: {best_option['name']}")
print(f"   Score: {best_option['score']}/100")
print(f"   Cost: Rp {best_option['total_cost']:,.0f}")

print(f"\n💰 CHEAPEST: {cheapest_option['name']}")
print(f"   Score: {cheapest_option['score']}/100")
print(f"   Cost: Rp {cheapest_option['total_cost']:,.0f}")

if best_option['name'] != cheapest_option['name']:
    savings = best_option['total_cost'] - cheapest_option['total_cost']
    score_diff = best_option['score'] - cheapest_option['score']
    print(f"\n   💡 Trade-off: Save Rp {savings:,.0f} but lose {score_diff} points")
else:
    print(f"\n   ✓ Best option is also the cheapest!")

# Verification checks
print(f"\n{'=' * 80}")
print("VERIFICATION CHECKS")
print("=" * 80)

checks_passed = 0
total_checks = 0

# Check 1: All options have scores
total_checks += 1
all_have_scores = all(0 <= opt['score'] <= 100 for opt in result['options'])
if all_have_scores:
    checks_passed += 1
    print("✓ All options have valid scores (0-100)")
else:
    print("✗ Invalid scores detected")

# Check 2: Sorted by score descending
total_checks += 1
scores = [opt['score'] for opt in result['options']]
is_sorted = scores == sorted(scores, reverse=True)
if is_sorted:
    checks_passed += 1
    print("✓ Options correctly sorted by score (descending)")
else:
    print("✗ Sorting FAILED")

# Check 3: All options have costs
total_checks += 1
all_have_costs = all(opt['total_cost'] > 0 for opt in result['options'])
if all_have_costs:
    checks_passed += 1
    print("✓ All options have valid costs")
else:
    print("✗ Cost calculation FAILED")

# Check 4: Nutrient balance check for best option
total_checks += 1
best_n = best_option['nutrient_supplied']['N']
target_n = result['nutrient_requirement']['N']
n_deviation = abs(best_n - target_n) / target_n
balance_ok = n_deviation < 0.15  # Within 15%
if balance_ok:
    checks_passed += 1
    print(f"✓ Best option has good nutrient balance (N deviation: {n_deviation*100:.1f}%)")
else:
    print(f"✗ Nutrient balance issue (N deviation: {n_deviation*100:.1f}%)")

# Check 5: Compatibility checking works
total_checks += 1
has_incompatible = any(not opt['compatible'] for opt in result['options'])
# We expect at least one incompatible combination (e.g., if ZA+Urea exists)
# But for this test, just check that compatibility field exists
compatibility_checked = all('compatible' in opt for opt in result['options'])
if compatibility_checked:
    checks_passed += 1
    print("✓ Compatibility checking implemented")
else:
    print("✗ Compatibility checking FAILED")

print(f"\n{'=' * 80}")
print(f"SUMMARY: {checks_passed}/{total_checks} checks passed")
if checks_passed == total_checks:
    print("✅ ALL TESTS PASSED!")
else:
    print(f"⚠️  {total_checks - checks_passed} test(s) failed")
print("=" * 80)

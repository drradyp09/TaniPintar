import sys
import os

# Add backend and backend/app to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
sys.path.append(os.path.join(os.getcwd(), 'backend', 'app'))

from app.services.agri_logic import agri_logic

def test_penman_monteith():
    print("Testing FAO Penman-Monteith ETo Calculation...")
    # Standard conditions: Tmin=20, Tmax=30, RH=70%, Wind=2m/s
    eto = agri_logic.calculate_eto_penman_monteith(20, 30, 70, 2.0)
    print(f"ETo result: {eto} mm/day")
    assert eto > 0 and eto < 15 # Realistic range
    print("✅ Penman-Monteith Success\n")

def test_kc_interpolation():
    print("Testing Kc Growth Stage Interpolation...")
    # Padi: stages [20, 30, 60, 30], kc [1.05, 1.2, 0.9]
    # Day 1 (Ini): 1.05
    # Day 35 (Dev): middle of dev stage (20 + 15)
    # Day 80 (Mid): 1.2
    # Day 130 (Late): decreasing
    
    kc_init = agri_logic.get_kc_interpolated("padi", 10)
    kc_dev = agri_logic.get_kc_interpolated("padi", 35)
    kc_mid = agri_logic.get_kc_interpolated("padi", 80)
    kc_late = agri_logic.get_kc_interpolated("padi", 125)
    
    print(f"Kc Initial (Day 10): {kc_init}")
    print(f"Kc Development (Day 35): {kc_dev}")
    print(f"Kc Mid (Day 80): {kc_mid}")
    print(f"Kc Late (Day 125): {kc_late}")
    
    assert kc_init == 1.05
    assert kc_dev > 1.05 and kc_dev < 1.2
    assert kc_mid == 1.2
    assert kc_late < 1.2 and kc_late > 0.9
    print("✅ Kc Interpolation Success\n")

def test_seasonal_projection():
    print("Testing Seasonal Demand Projection...")
    res = agri_logic.calculate_seasonal_demand("padi", 1000, eto_avg=4.0)
    print(f"Total days: {res['total_days']}")
    print(f"Total water: {res['total_water_liters']} Liters")
    assert res['total_days'] == 140
    assert res['total_water_liters'] > 0
    print("✅ Seasonal Projection Success\n")

if __name__ == "__main__":
    try:
        test_penman_monteith()
        test_kc_interpolation()
        test_seasonal_projection()
        print("All advanced agricultural logic tests passed!")
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

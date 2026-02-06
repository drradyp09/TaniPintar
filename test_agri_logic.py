import sys
import os

# Add backend and backend/app to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
sys.path.append(os.path.join(os.getcwd(), 'backend', 'app'))

from app.services.agri_logic import agri_logic

def test_water_calc():
    print("Testing Irrigation Calculation...")
    # Padi, 30 days old, 1000m2, 25-30 deg C
    result = agri_logic.calculate_irrigation("padi", 30, 1000, 25, 30)
    print(f"Result for Padi (30 days, 1000m2): {result}")
    assert result['water_liters'] > 0
    assert result['eto'] > 0
    print("✅ Irrigation Calculation Success\n")

def test_fertilizer_calc():
    print("Testing Fertilizer Recommendation...")
    # Jagung, 10000m2 (1 ha)
    result = agri_logic.recommend_fertilizer("jagung", 10000)
    print(f"Result for Jagung (10000m2): {result}")
    assert result['urea'] == 250
    assert result['sp36'] == 150
    assert result['kcl'] == 100
    print("✅ Fertilizer Recommendation Success\n")

if __name__ == "__main__":
    try:
        test_water_calc()
        test_fertilizer_calc()
        print("All agricultural logic tests passed!")
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        sys.exit(1)

"""
Test script for Dynamic Pricing System
Tests price retrieval, trend calculation, and database integration.

Usage:
    python test_dynamic_pricing.py
"""

from app import create_app, db
from app.models import FertilizerPrice, User
from app.services.agri_logic import agri_logic
from datetime import datetime, timedelta
import json

def test_dynamic_pricing():
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("DYNAMIC PRICING SYSTEM TEST")
        print("=" * 60)
        
        # Test 1: Get current prices (should use static fallback if no DB data)
        print("\n📊 Test 1: Get Current Prices (Fallback to Static)")
        print("-" * 60)
        
        urea_price = agri_logic.get_current_price('urea')
        sp36_price = agri_logic.get_current_price('sp36')
        kcl_price = agri_logic.get_current_price('kcl')
        
        print(f"Urea:  Rp {urea_price:,}/kg")
        print(f"SP-36: Rp {sp36_price:,}/kg")
        print(f"KCl:   Rp {kcl_price:,}/kg")
        
        # Test 2: Get all current prices
        print("\n📋 Test 2: Get All Current Prices")
        print("-" * 60)
        
        all_prices = agri_logic.get_all_current_prices()
        for fert_type, data in list(all_prices.items())[:3]:  # Show first 3
            print(f"{fert_type.upper()}: Rp {data['price_per_kg']:,}/kg")
        print(f"... and {len(all_prices) - 3} more fertilizers")
        
        # Test 3: Add some historical prices for testing
        print("\n💾 Test 3: Adding Historical Price Data")
        print("-" * 60)
        
        # Create test prices for last 30 days
        base_date = datetime.utcnow() - timedelta(days=30)
        test_prices = [
            {'date': base_date, 'price': 2400},
            {'date': base_date + timedelta(days=10), 'price': 2450},
            {'date': base_date + timedelta(days=20), 'price': 2480},
            {'date': datetime.utcnow(), 'price': 2500}
        ]
        
        for price_data in test_prices:
            price = FertilizerPrice(
                fertilizer_type='urea',
                price_per_kg=price_data['price'],
                effective_date=price_data['date'],
                source='test_data',
                notes='Test data for dynamic pricing verification'
            )
            db.session.add(price)
        
        try:
            db.session.commit()
            print("✅ Added 4 historical price points for Urea")
        except Exception as e:
            db.session.rollback()
            print(f"⚠️  Note: {str(e)}")
        
        # Test 4: Get price trend
        print("\n📈 Test 4: Get Price Trend (30 days)")
        print("-" * 60)
        
        trend = agri_logic.get_price_trend('urea', days=30)
        
        print(f"Fertilizer: {trend['fertilizer_type'].upper()}")
        print(f"Current Price: Rp {trend['current_price']:,}/kg")
        print(f"Change: {trend['change_percent']:+.2f}%")
        print(f"Average (30d): Rp {trend['avg_price']:,}/kg")
        print(f"Min: Rp {trend['min_price']:,}/kg | Max: Rp {trend['max_price']:,}/kg")
        print(f"Data Points: {trend['data_points']}")
        
        if trend['trend']:
            print("\nTrend Data:")
            for point in trend['trend']:
                print(f"  {point['date']}: Rp {point['price']:,}/kg ({point['source']})")
        
        # Test 5: Test cost calculation with dynamic pricing
        print("\n💰 Test 5: Cost Calculation with Dynamic Pricing")
        print("-" * 60)
        
        result = agri_logic.calculate_fertilizer_scientific(
            crop_type='padi',
            area_m2=10000,  # 1 hectare
            target_yield=6.0,
            soil_n_percent=0.15,
            soil_p_ppm=12,
            soil_k_me=0.3
        )
        
        print(f"Crop: {result['crop_name']}")
        print(f"Target Yield: {result['target_yield_ton_ha']} ton/ha")
        print(f"Total Cost: Rp {result['total_cost_idr']:,}")
        print(f"Fertilizers:")
        print(f"  - Urea: {result['fertilizer_total_kg']['urea']:.1f} kg")
        print(f"  - SP-36: {result['fertilizer_total_kg']['sp36']:.1f} kg")
        print(f"  - KCl: {result['fertilizer_total_kg']['kcl']:.1f} kg")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)

if __name__ == '__main__':
    test_dynamic_pricing()

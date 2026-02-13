"""
Seed script to populate initial fertilizer prices from static data.
Run this once after creating the FertilizerPrice table.

Usage:
    python seed_prices.py
"""

from app import create_app, db
from app.models import FertilizerPrice
from app.services.agri_logic import AgriLogic
from datetime import datetime, timedelta

def seed_fertilizer_prices():
    app = create_app()
    
    with app.app_context():
        # Check if prices already exist
        existing_count = FertilizerPrice.query.count()
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} price records.")
            response = input("Do you want to add initial baseline prices anyway? (y/n): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled.")
                return
        
        agri_logic = AgriLogic()
        now = datetime.utcnow()
        
        print("🌱 Seeding fertilizer prices with 30-day history...")
        
        count = 0
        for fert_type, data in agri_logic.FERTILIZER_COMPOSITION.items():
            base_price = data['price_per_kg']
            
            # Generate 30 days of history
            for i in range(30, -1, -1):
                date = now - timedelta(days=i)
                
                # Add some realistic variation: +/- 5% over time
                # Using a sine wave or random walk to make it look like a trend
                import math
                import random
                variation = math.sin(i / 5.0) * (base_price * 0.03) + (random.random() * 20 - 10)
                current_price = int(base_price + variation)
                
                price_record = FertilizerPrice(
                    fertilizer_type=fert_type,
                    price_per_kg=current_price,
                    effective_date=date,
                    source='simulated_history',
                    region='national',
                    notes=f'Simulated historical price for day {i}'
                )
                db.session.add(price_record)
                count += 1
            
            print(f"  ✓ {fert_type}: 31 records created")
        
        try:
            db.session.commit()
            print(f"\n✅ Successfully seeded {count} price records!")
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error seeding prices: {str(e)}")

if __name__ == '__main__':
    seed_fertilizer_prices()

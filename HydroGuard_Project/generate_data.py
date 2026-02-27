import pandas as pd
import random

data = []

for i in range(60):
    # Phase 1: NORMAL (0 to 19 seconds) - All zones are healthy
    if i < 20:
        p_z8 = random.uniform(53.0, 58.0) # Badnera
        p_z7 = random.uniform(53.0, 58.0) # Akoli
        p_z2 = random.uniform(53.0, 58.0) # Navsari

    # Phase 2: MICRO-CRACK (20 to 29 seconds) - Badnera & Navsari take slight damage
    elif i < 30:
        p_z8 = random.uniform(46.0, 50.0) # Z8 drops slightly
        p_z7 = random.uniform(53.0, 58.0) # Z7 is still normal
        p_z2 = random.uniform(46.0, 50.0) # Z2 drops slightly

    # Phase 3: MEDIUM DAMAGE (30 to 44 seconds) - Badnera gets worse, Akoli starts leaking
    elif i < 45:
        p_z8 = random.uniform(36.0, 42.0) # Z8 drops to Medium
        p_z7 = random.uniform(46.0, 50.0) # Z7 drops to Micro
        p_z2 = random.uniform(46.0, 50.0) # Z2 stays at Micro

    # Phase 4: CRITICAL & HOLD (45 to 59 seconds) - The 15-second presentation hold
    else:
        p_z8 = random.uniform(20.0, 28.0) # Z8 CRITICAL BURST!
        p_z7 = random.uniform(36.0, 42.0) # Z7 STAYS MEDIUM! (Does not go to 0)
        p_z2 = random.uniform(46.0, 50.0) # Z2 STAYS MICRO! 

    # Calculate Flow Rates based on their individual pressures
    f_z8 = (p_z8 * 8.5) + random.uniform(-10, 10)
    f_z7 = (p_z7 * 8.5) + random.uniform(-10, 10)
    f_z2 = (p_z2 * 8.5) + random.uniform(-10, 10)

    data.append([p_z8, f_z8, p_z7, f_z7, p_z2, f_z2])

# Save all 6 columns to the CSV
df = pd.DataFrame(data, columns=['p_z8', 'f_z8', 'p_z7', 'f_z7', 'p_z2', 'f_z2'])
df.to_csv('sensor_data.csv', index=False)
print("✅ Multi-Zone sensor_data.csv generated! The 60-second loop is ready.")
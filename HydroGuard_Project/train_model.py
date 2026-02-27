import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

print("🚀 Generating Training Data for ML Model...")

data = []
# 1. CLASS 0: NORMAL DATA (Healthy Pipes)
for _ in range(2000):
    p = np.random.uniform(50.0, 60.0)
    f = (p * 8.5) + np.random.uniform(-10, 10)
    data.append([p, f, 0])

# 2. CLASS 1: WARNING / MEDIUM LEAK (Micro-cracks)
for _ in range(1500):
    p = np.random.uniform(35.0, 49.9)
    f = (p * 8.5) + np.random.uniform(-20, 20)
    data.append([p, f, 1])

# 3. CLASS 2: CRITICAL BURST (Major Damage)
for _ in range(1500):
    p = np.random.uniform(15.0, 34.9)
    f = (p * 8.5) + np.random.uniform(-30, 30)
    data.append([p, f, 2])

df = pd.DataFrame(data, columns=['pressure', 'flow', 'label'])

# Prepare Data for Training
X = df[['pressure', 'flow']]
y = df['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🧠 Training Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X_train, y_train)

# Evaluate the Model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred) * 100

print("\n" + "="*60)
print(f"✅ MODEL TRAINING COMPLETE!")
print(f"🎯 Overall Model Accuracy: {accuracy:.2f}%")
print("-" * 60)
print("📊 CLASSIFICATION REPORT (Take a screenshot for your PPT!):")
print(classification_report(y_test, y_pred, target_names=["Normal (0)", "Medium Leak (1)", "Critical Burst (2)"]))
print("="*60 + "\n")

# Save the trained model to a file so app.py can use it
joblib.dump(model, 'hydro_model.pkl')
print("💾 Model saved successfully as 'hydro_model.pkl'.")
# predict.py
import os
import joblib
import pandas as pd

# Load models on module import
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS = {}
DISEASE_KEYS = ['cholesterol', 'heart_disease', 'anaemia', 'jaundice']

for key in DISEASE_KEYS:
    model_path = os.path.join(BASE_DIR, f"{key}_model.joblib")
    if os.path.exists(model_path):
        MODELS[key] = joblib.load(model_path)
    else:
        print(f"Warning: Model file not found at {model_path}")

def get_risk_category(prob):
    """
    Assign risk categories based on continuous probability:
    0.00-0.29 = Low
    0.30-0.59 = Moderate
    0.60-0.79 = High
    0.80-1.00 = Very High
    """
    if prob <= 0.29:
        return "Low"
    elif prob <= 0.59:
        return "Moderate"
    elif prob <= 0.79:
        return "High"
    else:
        return "Very High"

def predict_health_risks(patient_data):
    """
    Predicts continuous risks and categorical ranges for:
    High Cholesterol, Heart Disease, Anaemia, Jaundice.
    
    patient_data can be a dictionary of features or a list of dictionaries.
    """
    if isinstance(patient_data, dict):
        df = pd.DataFrame([patient_data])
    else:
        df = pd.DataFrame(patient_data)
        
    results = {}
    
    # Run predictions
    for key in DISEASE_KEYS:
        model = MODELS.get(key)
        if model:
            # Predict probability
            prob = float(model.predict_proba(df)[0, 1])
            results[f"{key}_risk"] = round(prob, 2)
            results[f"{key}_category"] = get_risk_category(prob)
        else:
            results[f"{key}_risk"] = None
            results[f"{key}_category"] = "Unknown"
            
    return results

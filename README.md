
AI Health Prediction System
## 💻 Software 
The software component of the project uses a **machine-learning based health risk prediction system** to estimate the risk of four major health conditions:

* 🧪 **High Cholesterol**
* ❤️ **Heart Disease**
* 🩸 **Anaemia**
* 🟡 **Jaundice**

The system processes patient demographic information, lifestyle factors, symptoms, family history, vital signs, and laboratory measurements through a customized ML preprocessing pipeline.

---

### 🧠 Input Feature Space

The ML pipeline uses **48 input features**, divided into numerical and categorical features.

#### 📊 Numerical Features — 37

**Demographics & Vital Signs**

```text
Age
BMI
Sleep_Hours
Systolic_BP_mmHg
Diastolic_BP_mmHg
Resting_Heart_Rate_bpm
```

**Symptoms**

```text
Chest_Pain
Shortness_of_Breath
Fatigue
Palpitations
Dizziness
Exercise_Induced_Angina
Abdominal_Pain
Nausea
Dark_Urine
Pale_Stool
Yellow_Eyes_or_Skin
Pale_Skin
```

**Underlying Conditions & Risk Factors**

```text
Hypertension
Diabetes
Pregnancy
Chronic_Illness
Bleeding_Risk
Previous_Liver_Disease
Hepatitis_Risk_Indicator
```

**Biomarkers & Laboratory Measurements**

```text
Total_Cholesterol_mg_dL
LDL_mg_dL
HDL_mg_dL
Triglycerides_mg_dL
Hemoglobin_g_dL
MCV_fL
Ferritin_ng_mL
Vitamin_B12_pg_mL
Total_Bilirubin_mg_dL
AST_U_L
ALT_U_L
ALP_U_L
```

#### 🔤 Categorical Features — 11

**Lifestyle & Demographics**

```text
Sex
Smoking_Status
Physical_Activity
Diet_Quality
Alcohol_Use
Iron_Diet
Menstruation
```

**Family History**

```text
Family_History_High_Cholesterol
Family_History_Heart_Disease
Family_History_Anaemia
Family_History_Liver_Disease
```

---

### ⚙️ Data Preprocessing

Each model uses a customized `ColumnTransformer` pipeline.

**Numerical Features**

* Missing values → Median Imputation
* Feature scaling → `StandardScaler`

**Categorical Features**

* Missing values → `"None"` / most-frequent imputation
* Encoding → `OneHotEncoder`

This ensures that raw patient data can be directly passed through the same preprocessing pipeline used during training.

---

### 🤖 ML Model Architecture

Four independent models are used for the four health conditions:

| Health Condition | ML Model             | Configuration                                    |
| ---------------- | -------------------- | ------------------------------------------------ |
| 🧪 Cholesterol   | `LogisticRegression` | `C=1.0`, `solver=lbfgs`                          |
| ❤️ Heart Disease | `LogisticRegression` | `C=1.0`, `solver=lbfgs`                          |
| 🩸 Anaemia       | `XGBClassifier`      | `n_estimators=100`                               |
| 🟡 Jaundice      | `LogisticRegression` | `C=1.0`, `solver=lbfgs`, `class_weight=balanced` |

All models use:

```text
random_state = 42
```

The models were selected after comparing candidate architectures using stratified evaluation.

---

### 📈 Risk Prediction

Instead of returning only a binary `0` or `1`, the system generates a **continuous risk probability between 0 and 1** using model probability prediction.

Example:

```text
Cholesterol Risk     → 0.82
Heart Disease Risk   → 0.64
Anaemia Risk         → 0.21
Jaundice Risk        → 0.08
```

#### Risk Classification

| Risk Probability | Category     |
| ---------------: | ------------ |
|    `0.00 – 0.29` | 🟢 Low       |
|    `0.30 – 0.59` | 🟡 Moderate  |
|    `0.60 – 0.79` | 🟠 High      |
|    `0.80 – 1.00` | 🔴 Very High |

---

### 🔄 Software Pipeline

```text
                    Patient Data
                         │
                         ▼
                ┌─────────────────┐
                │ Data Preprocess  │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        Numerical Data        Categorical Data
              │                     │
       Median + Scaling       Imputation + Encoding
              │                     │
              └──────────┬──────────┘
                         ▼
                  Feature Pipeline
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Cholesterol       Heart         Anaemia
       Model           Model          Model
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    Jaundice Model
                         │
                         ▼
                  Risk Probability
                       0 → 1
                         │
                         ▼
                   Risk Category
```

---

### 🛠️ Software Technologies

```text
Python
Scikit-learn
XGBoost
Pandas
NumPy
OpenPyXL
Joblib
FastAPI
```

### ⚠️ Disclaimer

> **This AI system is a software prototype designed for research and educational purposes. The generated risk scores are model-based estimates and should not be considered medical diagnoses or a replacement for professional medical consultation.**

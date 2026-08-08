// src/pages/Registration.tsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IntakeContext } from "../contexts/IntakeContext";
import { useTranslation } from "../utils/useTranslation";
import { TagInput } from "../components/TagInput";
import { Trash2, FolderOpen, User, Calendar, MapPin, Activity } from "lucide-react";

export default function Registration() {
  const { t } = useTranslation();
  const { setIntake } = useContext(IntakeContext);
  const navigate = useNavigate();

  // Basic patient information
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Dynamic intake fields
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);

  // History of submitted records (loaded from localStorage)
  const [history, setHistory] = useState<Array<any>>([]);

  // Load any existing history on component mount
  useEffect(() => {
    const saved = localStorage.getItem("patient_records");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record = { 
      id: Date.now().toString(),
      name: name.trim(), 
      age: age.trim(), 
      gender, 
      location: location.trim(), 
      symptoms, 
      lifestyle, 
      familyHistory,
      timestamp: new Date().toLocaleDateString()
    };
    
    // Update intake context
    setIntake({ symptoms, lifestyle, familyHistory });
    
    // Persist the new record at the front of the history array
    const updated = [record, ...history];
    localStorage.setItem("patient_records", JSON.stringify(updated));
    setHistory(updated);
    
    // Reset form fields for next entry
    setName("");
    setAge("");
    setGender("");
    setLocation("");
    setSymptoms([]);
    setLifestyle([]);
    setFamilyHistory([]);
    
    // Navigate to results page
    navigate("/results");
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      const updated = history.filter(rec => rec.id !== id);
      localStorage.setItem("patient_records", JSON.stringify(updated));
      setHistory(updated);
    }
  };

  const handleLoadRecord = (rec: any) => {
    setName(rec.name);
    setAge(rec.age);
    setGender(rec.gender);
    setLocation(rec.location);
    setSymptoms(rec.symptoms || []);
    setLifestyle(rec.lifestyle || []);
    setFamilyHistory(rec.familyHistory || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keywords suggestions matching backend feature mapping keys
  const symptomsSuggestions = [
    "chest_pain", "fatigue", "dizziness", "shortness_of_breath", 
    "abdominal_pain", "nausea", "pale_skin", "yellow_eyes", 
    "dark_urine", "pale_stool"
  ];
  const lifestyleSuggestions = ["smoking", "alcohol", "sedentary", "poor_diet", "low_iron"];
  const familySuggestions = [
    "high_cholesterol", "heart_disease", "anaemia", 
    "jaundice", "diabetes", "hypertension"
  ];

  return (
    <div style={{ maxWidth: 840, margin: "40px auto", padding: "0 20px", fontFamily: "inherit" }}>
      {/* Header card */}
      <div style={{ 
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))", 
        border: "1px solid var(--hairline)", 
        borderRadius: "var(--r-3)", 
        padding: "32px", 
        marginBottom: "32px",
        boxShadow: "var(--shadow-pop)",
        backdropFilter: "blur(8px)"
      }}>
        <h1 style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "36px", 
          fontWeight: 600, 
          letterSpacing: "-0.022em", 
          marginBottom: "12px", 
          color: "var(--ink)" 
        }}>
          {t('patientIntake') ?? 'Patient Intake'}
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: "16px", maxWidth: "60ch", lineHeight: 1.6 }}>
          Register a new patient or load an existing profile to analyze chronic health risk factors with our trained ML classifiers.
        </p>
      </div>

      {/* Main Intake Form */}
      <div style={{ 
        background: "var(--paper)", 
        border: "1px solid var(--hairline)", 
        borderRadius: "var(--r-3)", 
        padding: "32px", 
        boxShadow: "var(--shadow-pop)",
        marginBottom: "40px"
      }}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            <User size={18} color="var(--accent)" /> Demographics
          </h2>
          
          {/* Basic demographic fields */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder={t('name') ?? 'Full Name'} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ 
                  width: "100%",
                  padding: "12px 14px", 
                  borderRadius: 8, 
                  border: "1px solid var(--hairline)", 
                  background: "var(--surface)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                  fontSize: "14px"
                }} 
              />
            </div>
            
            <div style={{ position: "relative" }}>
              <input 
                type="number" 
                placeholder={t('age') ?? 'Age (Years)'} 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                required 
                style={{ 
                  width: "100%",
                  padding: "12px 14px", 
                  borderRadius: 8, 
                  border: "1px solid var(--hairline)", 
                  background: "var(--surface)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                  fontSize: "14px"
                }} 
              />
            </div>

            <div style={{ position: "relative" }}>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                required 
                style={{ 
                  width: "100%",
                  padding: "12px 14px", 
                  borderRadius: 8, 
                  border: "1px solid var(--hairline)", 
                  background: "var(--surface)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="">{t('gender') ?? 'Select Gender'}</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder={t('location') ?? 'Location / City'} 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
                style={{ 
                  width: "100%",
                  padding: "12px 14px", 
                  borderRadius: 8, 
                  border: "1px solid var(--hairline)", 
                  background: "var(--surface)",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                  fontSize: "14px"
                }} 
              />
            </div>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px", color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--hairline)", paddingTop: "24px" }}>
            <Activity size={18} color="var(--accent)" /> Clinical Indicators
          </h2>

          {/* Tag based dynamic inputs with keyword preset suggestions */}
          <TagInput 
            label={t('symptoms') ?? 'Symptoms'} 
            placeholder="Type symptoms and press Enter" 
            values={symptoms} 
            setValues={setSymptoms} 
            presetSuggestions={symptomsSuggestions}
          />
          
          <TagInput 
            label={t('lifestyle') ?? 'Lifestyle Factors'} 
            placeholder="Type lifestyle habits and press Enter" 
            values={lifestyle} 
            setValues={setLifestyle} 
            presetSuggestions={lifestyleSuggestions}
          />
          
          <TagInput 
            label={t('familyHistory') ?? 'Family Clinical History'} 
            placeholder="Type hereditary history and press Enter" 
            values={familyHistory} 
            setValues={setFamilyHistory} 
            presetSuggestions={familySuggestions}
          />

          <button 
            type="submit" 
            style={{ 
              marginTop: 12, 
              width: "100%", 
              padding: "14px", 
              borderRadius: 10, 
              background: "linear-gradient(135deg, var(--accent), #8b5cf6)", 
              color: "#fff", 
              border: "none", 
              fontSize: "16px", 
              fontWeight: 600, 
              cursor: "pointer", 
              boxShadow: "var(--shadow-pop)",
              transition: "transform 0.15s ease, opacity 0.15s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {t('calculateRisk') ?? 'Analyze Risk Profile & Predict →'}
          </button>
        </form>
      </div>

      {/* History Database */}
      <section style={{ 
        background: "var(--paper)", 
        border: "1px solid var(--hairline)", 
        borderRadius: "var(--r-3)", 
        padding: "32px", 
        boxShadow: "var(--shadow-pop)" 
      }}>
        <h2 style={{ 
          fontSize: "22px", 
          fontWeight: 600, 
          marginBottom: "20px", 
          color: "var(--ink)",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <span>{t('history') ?? 'Patient Records Database'}</span>
          <span style={{ fontSize: "12px", padding: "4px 10px", background: "var(--surface-sunken)", borderRadius: 12, color: "var(--ink-3)", fontWeight: 500 }}>
            {history.length} {history.length === 1 ? 'record' : 'records'} saved
          </span>
        </h2>
        
        {history.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", border: "1px dashed var(--hairline)", borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: "15px" }}>No patient records stored in this database yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {history.map((rec) => (
              <div 
                key={rec.id} 
                style={{ 
                  padding: "20px", 
                  borderRadius: "12px", 
                  border: "1px solid var(--hairline)", 
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  position: "relative",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-pop)";
                  e.currentTarget.style.borderColor = "var(--accent-soft-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--hairline)";
                }}
              >
                {/* Profile Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "var(--ink)" }}>{rec.name}</h3>
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "13px", color: "var(--ink-3)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {rec.age} years</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={13} /> {rec.gender.toUpperCase()}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {rec.location}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => handleLoadRecord(rec)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--hairline)",
                        background: "var(--paper)",
                        color: "var(--accent)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-soft)";
                        e.currentTarget.style.borderColor = "var(--accent-soft-2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--paper)";
                        e.currentTarget.style.borderColor = "var(--hairline)";
                      }}
                    >
                      <FolderOpen size={13} /> Load
                    </button>
                    <button 
                      onClick={(e) => handleDeleteRecord(rec.id, e)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        background: "var(--paper)",
                        color: "var(--error)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--error-soft)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--paper)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
                
                {/* Profile Details Tag list */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                  gap: 12,
                  borderTop: "1px solid var(--hairline)",
                  paddingTop: 12,
                  fontSize: "13px"
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{t('symptoms') ?? 'Symptoms'}:</span>{" "}
                    <span style={{ color: "var(--ink-3)" }}>
                      {rec.symptoms && rec.symptoms.length > 0 ? rec.symptoms.join(", ") : "None reported"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{t('lifestyle') ?? 'Lifestyle'}:</span>{" "}
                    <span style={{ color: "var(--ink-3)" }}>
                      {rec.lifestyle && rec.lifestyle.length > 0 ? rec.lifestyle.join(", ") : "None reported"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{t('familyHistory') ?? 'Family History'}:</span>{" "}
                    <span style={{ color: "var(--ink-3)" }}>
                      {rec.familyHistory && rec.familyHistory.length > 0 ? rec.familyHistory.join(", ") : "None reported"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

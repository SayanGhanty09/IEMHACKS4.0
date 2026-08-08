// Phase 3: Teleconsultation scheduling view
import { useState, useEffect } from "react";
import { nearestPHC, type PHC } from "../utils/haversine";
import { useTranslation } from "../utils/useTranslation";

interface Slot { date: string; time: string; }
interface Appointment extends Slot { phc: string; doctor: string; notes: string; id: string; }

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];
const STORAGE_KEY = "anebilin_appointments";

function loadAppointments(): Appointment[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

export default function Teleconsultation() {
  const { t } = useTranslation();
  const [phcs, setPhcs] = useState<(PHC & { distanceKm: number })[]>([]);
  const [sel, setSel] = useState<{ phc: string; date: string; time: string; doctor: string; notes: string }>({
    phc:"", date:"", time:"", doctor:"Dr. Available", notes:""
  });
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  const [msg, setMsg] = useState("");
  const [locErr, setLocErr] = useState("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setPhcs(nearestPHC(pos.coords.latitude, pos.coords.longitude)),
      () => { setLocErr("Location unavailable — showing all PHCs by default."); setPhcs(nearestPHC(20.5937,78.9629)); }
    );
  }, []);

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel.phc || !sel.date || !sel.time) { setMsg("Please fill all required fields."); return; }
    const appt: Appointment = { ...sel, id: crypto.randomUUID() };
    const updated = [...appointments, appt];
    setAppointments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMsg(`✅ Appointment booked at ${sel.phc} on ${sel.date} at ${sel.time}`);
    setSel({ phc:"", date:"", time:"", doctor:"Dr. Available", notes:"" });
  };

  const cancel = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const card: React.CSSProperties = {
    background:"#fff", border:"1px solid #e2e8f0", borderRadius:12,
    padding:"20px 24px", marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
  };

  return (
    <div style={{ maxWidth:760, margin:"32px auto", padding:"0 20px" }}>
      <h1 style={{ fontSize:26, fontWeight:700, marginBottom:4 }}>📅 {t('teleconsultation')}</h1>
      <p style={{ color:"#64748b", marginBottom:28 }}>Schedule appointments at your nearest PHC or health centre.</p>

      {locErr && <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13 }}>{locErr}</div>}

      {/* Booking form */}
      <div style={card}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>{t('bookAppointment')}</h2>
        <form onSubmit={book} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:4 }}>Select PHC / Health Centre *</label>
            <select required style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", fontSize:14 }}
              value={sel.phc} onChange={e=>setSel({...sel,phc:e.target.value})}>
              <option value="">-- Select --</option>
              {phcs.map(p=><option key={p.name} value={p.name}>{p.name} ({p.distanceKm} km away)</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
              <input type="date" required min={new Date().toISOString().split("T")[0]}
                style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", fontSize:14 }}
                value={sel.date} onChange={e=>setSel({...sel,date:e.target.value})} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:4 }}>Time Slot *</label>
              <select required style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", fontSize:14 }}
                value={sel.time} onChange={e=>setSel({...sel,time:e.target.value})}>
                <option value="">-- Select --</option>
                {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:4 }}>Notes (optional)</label>
            <textarea rows={2} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #cbd5e1", fontSize:14 }}
              value={sel.notes} onChange={e=>setSel({...sel,notes:e.target.value})} placeholder="Reason for visit..." />
          </div>
          <button type="submit" style={{ padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            color:"#fff", border:"none", fontSize:15, fontWeight:600, cursor:"pointer" }}>
            Book Appointment
          </button>
        </form>
        {msg && <p style={{ marginTop:12, color: msg.startsWith("✅") ? "#16a34a" : "#dc2626", fontWeight:500 }}>{msg}</p>}
      </div>

      {/* Appointment log */}
      {appointments.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize:18, fontWeight:600, marginBottom:14 }}>My Appointments</h2>
          {appointments.map(a => (
            <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0", borderBottom:"1px solid #f1f5f9" }}>
              <div>
                <p style={{ fontWeight:600, margin:0 }}>{a.phc}</p>
                <p style={{ fontSize:13, color:"#64748b", margin:0 }}>{a.date} at {a.time}</p>
                {a.notes && <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>{a.notes}</p>}
              </div>
              <button onClick={()=>cancel(a.id)} style={{ padding:"6px 14px", borderRadius:6,
                background:"#fee2e2", color:"#dc2626", border:"none", cursor:"pointer", fontWeight:600, fontSize:12 }}>
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

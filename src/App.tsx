import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Dumbbell,
  Activity,
  Info,
  RotateCcw,
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  Loader2,
  Copy,
  Download,
  User,
  Target,
  FileText,
  Settings,
  X,
  Save,
  Bot,
} from 'lucide-react';
import AIAssistant from './components/AIAssistant';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Base de datos de ejercicios completa (Escuela Culturismo Natural + Nuevas Adiciones)
const EXERCISE_DATABASE = [
  // PECHO
  {
    name: 'Press de Banca Plano (Barra)',
    weights: { chest: 1.0, deltoidAnt: 0.5, triceps: 0.5 },
  },
  {
    name: 'Press Banca con Mancuernas',
    weights: { chest: 1.0, deltoidAnt: 0.5, triceps: 0.4 },
  },
  {
    name: 'Press Convergente (Plano)',
    weights: { chest: 1.0, deltoidAnt: 0.4, triceps: 0.4 },
  },
  {
    name: 'Press Convergente (Superior/Inclinado)',
    weights: { chest: 1.0, deltoidAnt: 0.7, triceps: 0.4 },
  },
  {
    name: 'Press Inclinado (Barra/Manc)',
    weights: { chest: 1.0, deltoidAnt: 0.7, triceps: 0.5 },
  },
  { name: 'Press Declinado', weights: { chest: 1.0, triceps: 0.4 } },
  { name: 'Aperturas / Peck Deck', weights: { chest: 1.0 } },
  { name: 'Cruces de Poleas', weights: { chest: 1.0 } },
  {
    name: 'Fondos en Paralelas',
    weights: { chest: 0.8, triceps: 1.0, deltoidAnt: 0.5, rearDelts: 0.3 },
  },

  // ESPALDA
  {
    name: 'Dominadas Pronas / Jalón',
    weights: { back: 1.0, biceps: 0.5, rearDelts: 0.3, abs: 0.1 },
  },
  {
    name: 'Dominadas Supinas',
    weights: { back: 0.8, biceps: 0.8, rearDelts: 0.2, abs: 0.1 },
  },
  {
    name: 'Jalón Barra Supino',
    weights: { back: 0.8, biceps: 0.8, rearDelts: 0.2 },
  },
  {
    name: 'Remo con Barra',
    weights: { back: 1.0, biceps: 0.5, rearDelts: 0.5, traps: 0.3, abs: 0.2 },
  },
  {
    name: 'Remo T Prono',
    weights: { back: 1.0, rearDelts: 0.6, biceps: 0.4, traps: 0.4, abs: 0.2 },
  },
  { name: 'Remo Gironda (Polea)', weights: { back: 1.0, rearDelts: 0.4 } },
  { name: 'Remo Unilateral Mancuerna', weights: { back: 1.0, biceps: 0.4 } },
  {
    name: 'Pullover (Polea/Manc)',
    weights: { back: 0.7, triceps: 0.2, chest: 0.1 },
  },
  {
    name: 'Peso Muerto Convencional',
    weights: { back: 0.6, glute: 0.7, femoral: 0.5, traps: 0.5, abs: 0.4 },
  },

  // PIERNAS Y GLÚTEO
  {
    name: 'Sentadilla Libre',
    weights: { quad: 1.0, glute: 0.5, femoral: 0.2, abs: 0.3 },
  },
  {
    name: 'Hack Squat',
    weights: { quad: 1.0, glute: 0.4, calves: 0.2, abs: 0.2 },
  },
  { name: 'Prensa de Piernas 45º', weights: { quad: 1.0, glute: 0.3 } },
  {
    name: 'Zancadas / Sentadilla Búlgara',
    weights: { quad: 0.8, glute: 0.8, femoral: 0.3, abs: 0.2 },
  },
  { name: 'Extensiones Cuádriceps', weights: { quad: 1.0 } },
  {
    name: 'Peso Muerto Rumano',
    weights: { femoral: 1.0, glute: 0.8, back: 0.3, abs: 0.2 },
  },
  { name: 'Curl Femoral (Tumbado/Sentado)', weights: { femoral: 1.0 } },
  { name: 'Elevación de Talones', weights: { calves: 1.0 } },
  {
    name: 'Puente de Glúteos / Hip Thrust',
    weights: { glute: 1.0, femoral: 0.2 },
  },
  { name: 'Patada de Glúteos en Polea', weights: { glute: 1.0 } },
  {
    name: 'Hiperextensión de Glúteos (45º)',
    weights: { glute: 1.0, femoral: 0.4, back: 0.2 },
  },
  { name: 'Abductor en Máquina', weights: { glute: 1.0 } },
  { name: 'Aductor en Máquina', weights: { adductors: 1.0 } },

  // HOMBROS
  {
    name: 'Press Militar (Barra/Manc)',
    weights: { deltoidAnt: 1.0, triceps: 0.5, chest: 0.2, abs: 0.2 },
  },
  {
    name: 'Press Militar Máquina',
    weights: { deltoidAnt: 1.0, triceps: 0.5, chest: 0.2 },
  },
  { name: 'Elevaciones Laterales', weights: { deltoidLat: 1.0 } },
  { name: 'Pájaros / Facepulls', weights: { rearDelts: 1.0, traps: 0.4 } },
  {
    name: 'Deltoides Posterior en Máquina (Reverse Pec Deck)',
    weights: { rearDelts: 1.0, traps: 0.3 },
  },
  {
    name: 'Remo al Mentón',
    weights: { deltoidLat: 0.7, traps: 0.6, biceps: 0.3 },
  },

  // BRAZOS Y OTROS
  { name: 'Curl de Bíceps Barra', weights: { biceps: 1.0 } },
  { name: 'Curl Martillo', weights: { biceps: 0.8, brachialis: 1.0 } },
  { name: 'Curl Bayesian (Polea)', weights: { biceps: 1.0 } },
  { name: 'Spider Curl', weights: { biceps: 1.0 } },
  { name: 'Extensiones Tríceps Polea', weights: { triceps: 1.0 } },
  { name: 'Press Francés', weights: { triceps: 1.0 } },
  { name: 'Crunch Abdominal', weights: { abs: 1.0 } },
  { name: 'Elevación de Piernas', weights: { abs: 1.0 } },
];

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Pecho', color: 'bg-blue-500' },
  { id: 'back', name: 'Espalda', color: 'bg-green-600' },
  { id: 'quad', name: 'Cuádriceps', color: 'bg-orange-500' },
  { id: 'femoral', name: 'Isquios', color: 'bg-red-500' },
  { id: 'glute', name: 'Glúteo', color: 'bg-pink-500' },
  { id: 'adductors', name: 'Aductores', color: 'bg-lime-500' },
  { id: 'deltoidAnt', name: 'Delt. Anterior', color: 'bg-purple-500' },
  { id: 'deltoidLat', name: 'Delt. Lateral', color: 'bg-indigo-500' },
  { id: 'rearDelts', name: 'Delt. Posterior', color: 'bg-slate-600' },
  { id: 'biceps', name: 'Bíceps', color: 'bg-yellow-500' },
  { id: 'triceps', name: 'Tríceps', color: 'bg-cyan-500' },
  { id: 'traps', name: 'Trapecio', color: 'bg-emerald-500' },
  { id: 'calves', name: 'Gemelos', color: 'bg-amber-700' },
  { id: 'abs', name: 'Abdomen', color: 'bg-teal-500' },
];

// Configuración de Firebase
const firebaseConfig = { apiKey: 'demo', projectId: 'demo-project' };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'fitness-calc-v4';

export default function App() {
  const [user, setUser] = useState(null);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [activeDay, setActiveDay] = useState(0);
  const [dailyRoutines, setDailyRoutines] = useState({});
  const [recoveryType, setRecoveryType] = useState('standard');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [customExercises, setCustomExercises] = useState([]);

  // Estado para el asistente IA
  const [showAI, setShowAI] = useState(false);

  // Estados para el Modal de Crear Ejercicio
  const [showCreator, setShowCreator] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseWeights, setNewExerciseWeights] = useState([
    { muscle: 'chest', value: 1.0 },
  ]);

  // Perfil del Usuario
  const [profile, setProfile] = useState({
    name: 'SEBASTIÁN',
    objectives: 'ACUMULACIÓN DE VOLUMEN',
    weight: '',
    priorities: { squat: '', bench: '', deadlift: '' },
  });

  // Lista combinada de ejercicios (Base + Personalizados)
  const allExercises = useMemo(() => {
    return [...EXERCISE_DATABASE, ...customExercises].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [customExercises]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'routineData',
      'v4'
    );
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyRoutines(data.dailyRoutines || {});
          setDaysPerWeek(data.daysPerWeek || 3);
          setRecoveryType(data.recoveryType || 'standard');
          setCustomExercises(data.customExercises || []);
          if (data.profile) setProfile(data.profile);
        }
      },
      (err) => console.error('Firestore error:', err)
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const saveTimeout = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const userDocRef = doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'routineData',
          'v4'
        );
        await setDoc(userDocRef, {
          dailyRoutines,
          daysPerWeek,
          recoveryType,
          profile,
          customExercises,
          lastUpdated: new Date().toISOString(),
        });
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (err) {
        setSyncStatus('error');
      }
    }, 1500);
    return () => clearTimeout(saveTimeout);
  }, [
    dailyRoutines,
    daysPerWeek,
    recoveryType,
    profile,
    customExercises,
    user,
  ]);

  const addExercise = (dayIdx) => {
    const current = dailyRoutines[dayIdx] || [];
    setDailyRoutines({
      ...dailyRoutines,
      [dayIdx]: [
        ...current,
        {
          id: Date.now(),
          exerciseName: allExercises[0].name,
          sets: 3,
          reps: '8-10',
          kgs: '',
          rest: '1:30',
          rir: '2',
          tempo: 'Controlado',
          notes: '',
        },
      ],
    });
  };

  const removeExercise = (dayIdx, id) => {
    const filtered = (dailyRoutines[dayIdx] || []).filter(
      (item) => item.id !== id
    );
    setDailyRoutines({ ...dailyRoutines, [dayIdx]: filtered });
  };

  const updateExercise = (dayIdx, id, field, value) => {
    const updated = (dailyRoutines[dayIdx] || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setDailyRoutines({ ...dailyRoutines, [dayIdx]: updated });
  };

  const copyDay = (fromIdx) => {
    const toIdx = prompt(
      `¿A qué día quieres copiar la rutina del Día ${
        fromIdx + 1
      }? (1-${daysPerWeek})`
    );
    const targetIdx = parseInt(toIdx) - 1;
    if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= daysPerWeek) return;
    setDailyRoutines({
      ...dailyRoutines,
      [targetIdx]: JSON.parse(JSON.stringify(dailyRoutines[fromIdx] || [])),
    });
  };

  const saveNewExercise = () => {
    if (!newExerciseName.trim()) {
      alert('El ejercicio necesita un nombre');
      return;
    }
    const weights = {};
    newExerciseWeights.forEach((w) => {
      weights[w.muscle] = parseFloat(w.value);
    });

    setCustomExercises([
      ...customExercises,
      { name: newExerciseName.toUpperCase(), weights },
    ]);
    setShowCreator(false);
    setNewExerciseName('');
    setNewExerciseWeights([{ muscle: 'chest', value: 1.0 }]);
  };

  const addWeightRow = () => {
    if (newExerciseWeights.length < 3) {
      setNewExerciseWeights([
        ...newExerciseWeights,
        { muscle: 'chest', value: 0.5 },
      ]);
    }
  };

  const updateWeightRow = (idx, field, value) => {
    const updated = [...newExerciseWeights];
    updated[idx][field] = value;
    setNewExerciseWeights(updated);
  };

  const removeWeightRow = (idx) => {
    if (newExerciseWeights.length > 1) {
      setNewExerciseWeights(newExerciseWeights.filter((_, i) => i !== idx));
    }
  };

  const weeklyTotals = useMemo(() => {
    const counts = {};
    MUSCLE_GROUPS.forEach((m) => (counts[m.id] = 0));
    for (let i = 0; i < daysPerWeek; i++) {
      const routine = dailyRoutines[i] || [];
      routine.forEach((item) => {
        const exercise = allExercises.find((e) => e.name === item.exerciseName);
        if (exercise) {
          Object.entries(exercise.weights).forEach(([muscle, weight]) => {
            if (counts[muscle] !== undefined) {
              counts[muscle] += weight * item.sets;
            }
          });
        }
      });
    }
    return counts;
  }, [dailyRoutines, daysPerWeek, allExercises]);

  const thresholds = useMemo(() => {
    if (recoveryType === 'high') return { low: 12, optimal: 24, high: 25 };
    return { low: 10, optimal: 20, high: 21 };
  }, [recoveryType]);

  const exportToCSV = () => {
    let csv = `POWERBUILDER: ${profile.name}\n`;
    csv += `OBJETIVOS: ${profile.objectives}\n`;
    csv += `PESO KG EN AYUNAS: ${profile.weight}\n`;
    csv += `PRIORIDADES: Squat: ${profile.priorities.squat} | Bench: ${profile.priorities.bench} | Deadlift: ${profile.priorities.deadlift}\n\n`;

    for (let i = 0; i < daysPerWeek; i++) {
      csv += `DÍA ${i + 1}\n`;
      csv +=
        'N°,Ejercicio,N° Series,Rango Reps,Kgs,Descanso,RIR,Excéntricas,Observaciones\n';

      const routine = dailyRoutines[i] || [];
      routine.forEach((item, idx) => {
        csv += `${idx + 1},"${item.exerciseName}",${item.sets},"${item.reps}",${
          item.kgs
        },"${item.rest}",${item.rir},"${item.tempo}","${item.notes}"\n`;
      });
      csv += '\n';
    }

    csv += '\nRESUMEN DE SERIES X GRUPO MUSCULAR (VOLUMEN REAL)\n';
    csv += 'Grupo Muscular,Total Series Reales\n';
    MUSCLE_GROUPS.forEach((m) => {
      csv += `${m.name},${weeklyTotals[m.id].toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Mesociclo_${profile.name}.csv`);
    link.click();
  };

  const activeRoutine = dailyRoutines[activeDay] || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-2 sm:p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Cloud Sync Status */}
        <div className="flex justify-end mb-1 h-5 px-2">
          {syncStatus === 'saving' && (
            <div className="flex items-center gap-1 text-[8px] font-bold text-blue-500 uppercase">
              <Loader2 size={10} className="animate-spin" /> Guardando...
            </div>
          )}
          {syncStatus === 'synced' && (
            <div className="flex items-center gap-1 text-[8px] font-bold text-green-500 uppercase">
              <CheckCircle2 size={10} /> Sincronizado
            </div>
          )}
        </div>

        {/* Global Config & Profile */}
        <header className="mb-4 space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="text-red-600" size={20} />
                  <input
                    className="text-xl font-black text-slate-800 italic uppercase bg-transparent border-b border-dashed border-slate-200 focus:border-red-600 outline-none w-full"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="NOMBRE POWERBUILDER"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">
                      Objetivos
                    </label>
                    <input
                      className="w-full text-xs font-bold outline-none border-b border-slate-100 py-1"
                      value={profile.objectives}
                      onChange={(e) =>
                        setProfile({ ...profile, objectives: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[9px] font-black uppercase text-slate-400">
                      Peso KG
                    </label>
                    <input
                      className="w-full text-xs font-bold outline-none border-b border-slate-100 py-1"
                      value={profile.weight}
                      onChange={(e) =>
                        setProfile({ ...profile, weight: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-3">
                {['squat', 'bench', 'deadlift'].map((p) => (
                  <div key={p}>
                    <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                      <Target size={10} /> {p}
                    </label>
                    <input
                      className="w-full text-xs font-bold outline-none border-b border-slate-100 py-1 uppercase"
                      value={profile.priorities[p]}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          priorities: {
                            ...profile.priorities,
                            [p]: e.target.value,
                          },
                        })
                      }
                      placeholder="REPS/KG"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <button
                  onClick={() => setShowAI(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
                >
                  <Bot size={16} /> Coach IA
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl text-[10px] font-black transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
                >
                  <Download size={16} /> Exportar Mesociclo
                </button>
                <div className="flex bg-slate-100 p-0.5 rounded-xl">
                  {[2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDaysPerWeek(d)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                        daysPerWeek === d
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* Tabs de Días */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {Array.from({ length: daysPerWeek }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border ${
                    activeDay === idx
                      ? 'bg-slate-800 text-white border-slate-800 shadow-lg'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  Día {idx + 1}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-2 italic">
                  <FileText size={16} className="text-blue-500" /> Planilla de
                  Entrenamiento
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreator(true)}
                    className="text-[10px] font-black text-white px-3 py-1 rounded-full bg-slate-800 flex items-center gap-1 hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={12} /> CREAR EJERCICIO
                  </button>
                  <button
                    onClick={() => copyDay(activeDay)}
                    className="text-[10px] font-black text-blue-600 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 flex items-center gap-1"
                  >
                    <Copy size={12} /> DUPLICAR DÍA
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {activeRoutine.length === 0 ? (
                  <div className="text-center py-16 text-slate-300 italic border-2 border-dashed border-slate-100 rounded-3xl font-black uppercase text-xs">
                    Empieza a añadir ejercicios
                  </div>
                ) : (
                  activeRoutine.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative group hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 min-w-[250px]">
                          {' '}
                          {/* AQUÍ ESTÁ EL FIX: min-w para que no se aplaste */}
                          <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                            Ejercicio
                          </label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer focus:border-blue-500 transition-colors"
                            value={item.exerciseName}
                            onChange={(e) =>
                              updateExercise(
                                activeDay,
                                item.id,
                                'exerciseName',
                                e.target.value
                              )
                            }
                          >
                            {allExercises.map((ex) => (
                              <option key={ex.name} value={ex.name}>
                                {ex.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                              Series
                            </label>
                            <input
                              type="number"
                              className="w-full md:w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-black focus:border-blue-500 outline-none"
                              value={item.sets}
                              onChange={(e) =>
                                updateExercise(
                                  activeDay,
                                  item.id,
                                  'sets',
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                              Reps
                            </label>
                            <input
                              className="w-full md:w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-black focus:border-blue-500 outline-none"
                              value={item.reps}
                              onChange={(e) =>
                                updateExercise(
                                  activeDay,
                                  item.id,
                                  'reps',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                              Kgs
                            </label>
                            <input
                              className="w-full md:w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-sm font-black focus:border-blue-500 outline-none"
                              value={item.kgs}
                              onChange={(e) =>
                                updateExercise(
                                  activeDay,
                                  item.id,
                                  'kgs',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                            Descanso
                          </label>
                          <input
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:border-blue-500 outline-none"
                            value={item.rest}
                            onChange={(e) =>
                              updateExercise(
                                activeDay,
                                item.id,
                                'rest',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                            RIR
                          </label>
                          <input
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:border-blue-500 outline-none"
                            value={item.rir}
                            onChange={(e) =>
                              updateExercise(
                                activeDay,
                                item.id,
                                'rir',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                            Excéntricas / Tempo
                          </label>
                          <input
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:border-blue-500 outline-none"
                            value={item.tempo}
                            onChange={(e) =>
                              updateExercise(
                                activeDay,
                                item.id,
                                'tempo',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">
                          Observaciones
                        </label>
                        <input
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-blue-500 outline-none"
                          value={item.notes}
                          onChange={(e) =>
                            updateExercise(
                              activeDay,
                              item.id,
                              'notes',
                              e.target.value
                            )
                          }
                          placeholder="Ej: Fallo en la última serie..."
                        />
                        <button
                          onClick={() => removeExercise(activeDay, item.id)}
                          className="absolute -top-12 -right-2 p-2 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => addExercise(activeDay)}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase"
                >
                  <Plus size={24} /> Añadir Ejercicio
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-800 italic uppercase">
                  Volumen Real Semanal
                </h2>
                <button
                  onClick={() =>
                    setRecoveryType(
                      recoveryType === 'standard' ? 'high' : 'standard'
                    )
                  }
                  className={`text-[8px] font-black px-2 py-1 rounded-lg border transition-all ${
                    recoveryType === 'high'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  REC: {recoveryType === 'high' ? 'ALTA' : 'STD'}
                </button>
              </div>

              <div className="space-y-4">
                {MUSCLE_GROUPS.map((muscle) => {
                  const val = weeklyTotals[muscle.id] || 0;
                  const percentage = Math.min(
                    (val / thresholds.high) * 100,
                    100
                  );
                  let statusColor = 'text-amber-500';
                  if (val >= thresholds.low && val <= thresholds.optimal)
                    statusColor = 'text-green-600';
                  else if (val > thresholds.optimal)
                    statusColor = 'text-red-500';

                  return (
                    <div key={muscle.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                          {muscle.name}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-black ${statusColor}`}
                        >
                          {val.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className={`h-full transition-all duration-700 ${muscle.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] text-slate-400 font-black uppercase mb-2">
                  Meta Semanal
                </p>
                <div className="flex justify-between text-[10px] font-black text-slate-700">
                  <span>Mínimo: {thresholds.low}</span>
                  <span className="text-green-600">
                    Óptimo: {thresholds.optimal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asistente IA */}
        {showAI && (
          <AIAssistant
            onClose={() => setShowAI(false)}
            context={{
              profile,
              daysPerWeek,
              recoveryType,
              weeklyTotals,
              dailyRoutines,
            }}
          />
        )}

        {/* Modal Creador de Ejercicios */}
        {showCreator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 uppercase italic">
                  Crear Ejercicio
                </h3>
                <button
                  onClick={() => setShowCreator(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Nombre del Ejercicio
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 uppercase"
                    placeholder="EJ: PUENTE DE GLÚTEOS"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">
                    Impacto Muscular
                  </label>
                  {newExerciseWeights.map((w, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                        value={w.muscle}
                        onChange={(e) =>
                          updateWeightRow(idx, 'muscle', e.target.value)
                        }
                      >
                        {MUSCLE_GROUPS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        max="1.0"
                        min="0.1"
                        className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-center text-xs font-bold outline-none"
                        value={w.value}
                        onChange={(e) =>
                          updateWeightRow(idx, 'value', e.target.value)
                        }
                      />
                      {idx > 0 && (
                        <button
                          onClick={() => removeWeightRow(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {newExerciseWeights.length < 3 && (
                    <button
                      onClick={addWeightRow}
                      className="text-[10px] font-bold text-blue-500 flex items-center gap-1 mt-2 hover:underline"
                    >
                      <Plus size={12} /> AGREGAR OTRO MÚSCULO
                    </button>
                  )}
                </div>

                <button
                  onClick={saveNewExercise}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs mt-4 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all"
                >
                  <Save size={16} /> Guardar Ejercicio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, ExternalLink, Users, BookOpen, Bell, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User } from '../types';

type Tab = 'usuarios' | 'cursos' | 'alertas';

export default function Settings() {
  const { users, courses, currentUser, addUser, addCourse } = useStore();
  const [tab, setTab] = useState<Tab>('usuarios');
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'analista' as User['role'], department: '' });
  const [newCourse, setNewCourse] = useState({ name: '', facilitator: '', date: '', department: '', participants: '' });

  if (currentUser?.role !== 'gerencia' && currentUser?.role !== 'analista') {
    return <div className="p-6 text-gray-500">Sin permisos.</div>;
  }

  function handleCreateUser() {
    if (!newUser.name || !newUser.email) return;
    addUser({
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
    });
    setNewUser({ name: '', email: '', role: 'analista', department: '' });
    setShowNewUser(false);
  }

  function handleCreateCourse() {
    if (!newCourse.name || !newCourse.facilitator) return;
    addCourse({
      id: `c${Date.now()}`,
      name: newCourse.name,
      facilitator: newCourse.facilitator,
      date: newCourse.date,
      department: newCourse.department,
      participants: parseInt(newCourse.participants) || 0,
    });
    setNewCourse({ name: '', facilitator: '', date: '', department: '', participants: '' });
    setShowNewCourse(false);
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    { id: 'alertas', label: 'Alertas', icon: Bell },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestión de usuarios, cursos y umbrales de alerta</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Usuarios registrados</h3>
            {currentUser.role === 'gerencia' && (
              <button onClick={() => setShowNewUser(!showNewUser)}
                className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nuevo usuario
              </button>
            )}
          </div>

          {showNewUser && (
            <div className="px-5 py-4 bg-indigo-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                  placeholder="Nombre completo" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  placeholder="Correo electrónico" type="email" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={newUser.department} onChange={e => setNewUser(u => ({ ...u, department: e.target.value }))}
                  placeholder="Departamento" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as User['role'] }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="analista">Analista TH</option>
                  <option value="gerencia">Gerencia</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateUser}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Crear usuario
                </button>
                <button onClick={() => setShowNewUser(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden sm:table-cell">Correo</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden md:table-cell">Departamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700 shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-600">{u.email}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'gerencia' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {u.role === 'gerencia' ? 'Gerencia' : 'Analista TH'}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{u.department}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'cursos' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Cursos registrados</h3>
            <button onClick={() => setShowNewCourse(!showNewCourse)}
              className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nuevo curso
            </button>
          </div>

          {showNewCourse && (
            <div className="px-5 py-4 bg-indigo-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={newCourse.name} onChange={e => setNewCourse(c => ({ ...c, name: e.target.value }))}
                  placeholder="Nombre del curso" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={newCourse.facilitator} onChange={e => setNewCourse(c => ({ ...c, facilitator: e.target.value }))}
                  placeholder="Facilitador" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="date" value={newCourse.date} onChange={e => setNewCourse(c => ({ ...c, date: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={newCourse.department} onChange={e => setNewCourse(c => ({ ...c, department: e.target.value }))}
                  placeholder="Departamento" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" value={newCourse.participants} onChange={e => setNewCourse(c => ({ ...c, participants: e.target.value }))}
                  placeholder="Nº participantes" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateCourse}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Crear curso
                </button>
                <button onClick={() => setShowNewCourse(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {courses.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.facilitator} · {c.date} · {c.participants} participantes</p>
                </div>
                <a
                  href={`/survey/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Formulario
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'alertas' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Umbrales de Alerta</h3>
          <div className="space-y-5">
            <AlertThreshold
              label="Días sin aprobación para alerta de orden pendiente"
              defaultValue={3}
              unit="días"
            />
            <AlertThreshold
              label="NPS mínimo antes de alerta de baja satisfacción"
              defaultValue={20}
              unit="pts"
            />
            <AlertThreshold
              label="Días de retraso antes de alertar orden vencida"
              defaultValue={1}
              unit="días"
            />
            <AlertThreshold
              label="Rating mínimo de facilitador para alerta"
              defaultValue={3}
              unit="/ 5"
            />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              Las alertas se generan automáticamente y se envían al panel del analista TH.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertThreshold({ label, defaultValue, unit }: { label: string; defaultValue: number; unit: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-700 flex-1">{label}</p>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

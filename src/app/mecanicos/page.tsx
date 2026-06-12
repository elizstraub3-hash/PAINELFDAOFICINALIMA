'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type Mecanico = { id: string; nome: string; comissao: number }
const empty = (): Omit<Mecanico, 'id'> => ({ nome: '', comissao: 0 })

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Mecanico | null>(null)
  const [form, setForm] = useState(empty())

  async function load() {
    const data = await fetch('/api/mecanicos').then(r => r.json())
    setMecanicos(data)
  }
  useEffect(() => { load() }, [])

  function openNew() { setEditing(null); setForm(empty()); setModal(true) }
  function openEdit(m: Mecanico) { setEditing(m); setForm({ nome: m.nome, comissao: m.comissao }); setModal(true) }

  async function save() {
    if (!form.nome.trim()) return
    const payload = { ...form, comissao: Number(form.comissao) }
    if (editing) {
      await fetch(`/api/mecanicos/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/mecanicos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir este mecânico?')) return
    await fetch(`/api/mecanicos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mecânicos</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={16} /> Novo Mecânico
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Comissão</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mecanicos.length === 0 && (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Nenhum mecânico cadastrado</td></tr>
            )}
            {mecanicos.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{m.nome}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{m.comissao}%</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(m)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => del(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar Mecânico' : 'Novo Mecânico'}</h3>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do mecânico" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                <input type="number" min={0} max={100} step={0.5} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 10" value={form.comissao} onChange={e => setForm(f => ({ ...f, comissao: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={save} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

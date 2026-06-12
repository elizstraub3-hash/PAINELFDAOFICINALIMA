'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type Cliente = { id: string; nome: string; telefone?: string; email?: string; veiculo?: string; placa?: string }
const empty = (): Omit<Cliente, 'id'> => ({ nome: '', telefone: '', email: '', veiculo: '', placa: '' })

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(empty())

  async function load() {
    const data = await fetch('/api/clientes').then(r => r.json())
    setClientes(data)
  }
  useEffect(() => { load() }, [])

  function openNew() { setEditing(null); setForm(empty()); setModal(true) }
  function openEdit(c: Cliente) { setEditing(c); setForm({ nome: c.nome, telefone: c.telefone ?? '', email: c.email ?? '', veiculo: c.veiculo ?? '', placa: c.placa ?? '' }); setModal(true) }

  async function save() {
    if (!form.nome.trim()) return
    if (editing) {
      await fetch(`/api/clientes/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir este cliente?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nome', 'Telefone', 'Email', 'Veículo', 'Placa', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">Nenhum cliente cadastrado</td></tr>
            )}
            {clientes.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.nome}</td>
                <td className="px-4 py-3 text-gray-600">{c.telefone}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.veiculo}</td>
                <td className="px-4 py-3 text-gray-600">{c.placa}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                    <button onClick={() => del(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nome *', key: 'nome', placeholder: 'Nome completo' },
                { label: 'Telefone', key: 'telefone', placeholder: '(11) 99999-9999' },
                { label: 'Email', key: 'email', placeholder: 'email@exemplo.com' },
                { label: 'Veículo', key: 'veiculo', placeholder: 'Ex: Fiat Uno 2010' },
                { label: 'Placa', key: 'placa', placeholder: 'ABC-1234' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
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

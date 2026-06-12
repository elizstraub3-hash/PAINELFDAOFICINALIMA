'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'aguardando_orcamento', label: 'Aguardando Orçamento', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aguardando_peca', label: 'Aguardando Peça', color: 'bg-orange-100 text-orange-800' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' },
]

function getStatus(v: string) { return STATUS_OPTIONS.find(s => s.value === v) }
function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

type Servico = {
  id: string; descricao: string; status: string; observacoes?: string
  valorMaoDeObra: number; valorPecas: number; percentualPecas: number; hasPecas: boolean
  clienteId: string; mecanicoId?: string
  cliente?: { nome: string }; mecanico?: { nome: string; comissao: number }
}
type Cliente = { id: string; nome: string }
type Mecanico = { id: string; nome: string; comissao: number }

function emptyForm() {
  return { descricao: '', status: 'aguardando_orcamento', clienteId: '', mecanicoId: '', valorMaoDeObra: 0, valorPecas: 0, percentualPecas: 0, hasPecas: false, observacoes: '' }
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [filter, setFilter] = useState('')

  async function load() {
    const [s, c, m] = await Promise.all([
      fetch('/api/servicos').then(r => r.json()),
      fetch('/api/clientes').then(r => r.json()),
      fetch('/api/mecanicos').then(r => r.json()),
    ])
    setServicos(s); setClientes(c); setMecanicos(m)
  }
  useEffect(() => { load() }, [])

  function openNew() { setEditing(null); setForm(emptyForm()); setModal(true) }
  function openEdit(s: Servico) {
    setEditing(s)
    setForm({ descricao: s.descricao, status: s.status, clienteId: s.clienteId, mecanicoId: s.mecanicoId ?? '', valorMaoDeObra: s.valorMaoDeObra, valorPecas: s.valorPecas, percentualPecas: s.percentualPecas, hasPecas: s.hasPecas, observacoes: s.observacoes ?? '' })
    setModal(true)
  }

  async function save() {
    if (!form.descricao.trim() || !form.clienteId) return alert('Preencha a descrição e o cliente.')
    const payload = {
      ...form,
      valorMaoDeObra: Number(form.valorMaoDeObra),
      valorPecas: Number(form.valorPecas),
      percentualPecas: Number(form.percentualPecas),
      mecanicoId: form.mecanicoId || null,
    }
    if (editing) {
      await fetch(`/api/servicos/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch('/api/servicos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
    setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir este serviço?')) return
    await fetch(`/api/servicos/${id}`, { method: 'DELETE' })
    load()
  }

  const shown = filter ? servicos.filter(s => s.status === filter) : servicos

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Serviços</h2>
        <div className="flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Cliente', 'Descrição', 'Mecânico', 'Status', 'Mão de Obra', 'Peças', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {shown.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-8">Nenhum serviço encontrado</td></tr>}
            {shown.map(s => {
              const st = getStatus(s.status)
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.cliente?.nome}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{s.descricao}</td>
                  <td className="px-4 py-3 text-gray-600">{s.mecanico?.nome ?? <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${st?.color}`}>{st?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{fmt(s.valorMaoDeObra)}</td>
                  <td className="px-4 py-3 text-gray-700">{s.hasPecas ? `${fmt(s.valorPecas)} (+${s.percentualPecas}%)` : <span className="text-gray-400">Sem peças</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                      <button onClick={() => del(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.clienteId} onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descreva o serviço" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mecânico</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.mecanicoId} onChange={e => setForm(f => ({ ...f, mecanicoId: e.target.value }))}>
                  <option value="">Sem mecânico</option>
                  {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.comissao}%)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mão de Obra (R$)</label>
                <input type="number" min={0} step={0.01} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.valorMaoDeObra} onChange={e => setForm(f => ({ ...f, valorMaoDeObra: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasPecas" checked={form.hasPecas} onChange={e => setForm(f => ({ ...f, hasPecas: e.target.checked }))} className="rounded" />
                <label htmlFor="hasPecas" className="text-sm font-medium text-gray-700">Possui peças</label>
              </div>
              {form.hasPecas && (
                <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor das Peças (R$)</label>
                    <input type="number" min={0} step={0.01} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.valorPecas} onChange={e => setForm(f => ({ ...f, valorPecas: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Margem das Peças (%)</label>
                    <input type="number" min={0} max={500} step={1} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.percentualPecas} onChange={e => setForm(f => ({ ...f, percentualPecas: Number(e.target.value) }))} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Observações sobre o serviço" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
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

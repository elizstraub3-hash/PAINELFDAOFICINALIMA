'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const CATEGORIAS = [
  { value: 'mao_de_obra', label: 'Mão de Obra' },
  { value: 'peca', label: 'Peça' },
  { value: 'comissao', label: 'Comissão' },
  { value: 'secretaria', label: 'Secretária' },
  { value: 'outros', label: 'Outros' },
]

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('pt-BR') }

type Fluxo = { id: string; tipo: string; descricao: string; valor: number; categoria: string; data: string; servico?: { descricao: string } }
function emptyForm() { return { tipo: 'entrada', descricao: '', valor: 0, categoria: 'outros', data: new Date().toISOString().split('T')[0] } }

export default function FluxoCaixaPage() {
  const [fluxos, setFluxos] = useState<Fluxo[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [filter, setFilter] = useState('')

  async function load() {
    const data = await fetch('/api/fluxo-caixa').then(r => r.json())
    setFluxos(data)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.descricao.trim()) return
    await fetch('/api/fluxo-caixa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valor: Number(form.valor), data: new Date(form.data).toISOString() }),
    })
    setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await fetch(`/api/fluxo-caixa/${id}`, { method: 'DELETE' })
    load()
  }

  const shown = filter ? fluxos.filter(f => f.tipo === filter) : fluxos
  const entradas = fluxos.filter(f => f.tipo === 'entrada').reduce((a, f) => a + f.valor, 0)
  const saidas = fluxos.filter(f => f.tipo === 'saida').reduce((a, f) => a + f.valor, 0)

  const maoDeObra = fluxos.filter(f => f.categoria === 'mao_de_obra').reduce((a, f) => a + f.valor, 0)
  const comissoes = fluxos.filter(f => f.categoria === 'comissao').reduce((a, f) => a + f.valor, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fluxo de Caixa</h2>
        <button onClick={() => { setForm(emptyForm()); setModal(true) }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={16} /> Lançamento
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<TrendingUp className="text-green-600" size={20} />} label="Entradas" value={fmt(entradas)} bg="bg-green-50" text="text-green-700" />
        <SummaryCard icon={<TrendingDown className="text-red-600" size={20} />} label="Saídas" value={fmt(saidas)} bg="bg-red-50" text="text-red-700" />
        <SummaryCard icon={<DollarSign className="text-blue-600" size={20} />} label="Saldo" value={fmt(entradas - saidas)} bg="bg-blue-50" text={entradas - saidas >= 0 ? 'text-blue-700' : 'text-red-700'} />
        <SummaryCard icon={<DollarSign className="text-purple-600" size={20} />} label="Mão de Obra" value={fmt(maoDeObra)} bg="bg-purple-50" text="text-purple-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
          <span className="text-sm text-gray-500">{shown.length} lançamento(s)</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Data', 'Tipo', 'Descrição', 'Categoria', 'Serviço', 'Valor', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {shown.length === 0 && <tr><td colSpan={7} className="text-center text-gray-400 py-8">Nenhum lançamento</td></tr>}
            {shown.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(f.data)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${f.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {f.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{f.descricao}</td>
                <td className="px-4 py-3 text-gray-600">{CATEGORIAS.find(c => c.value === f.categoria)?.label ?? f.categoria}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{f.servico?.descricao ?? '—'}</td>
                <td className={`px-4 py-3 font-semibold ${f.tipo === 'entrada' ? 'text-green-700' : 'text-red-700'}`}>
                  {f.tipo === 'entrada' ? '+' : '-'}{fmt(f.valor)}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => del(f.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
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
              <h3 className="font-semibold text-lg">Novo Lançamento</h3>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <div className="flex gap-3">
                  {['entrada', 'saida'].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.tipo === t ? (t === 'entrada' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'border-gray-300 hover:bg-gray-50'}`}>
                      {t === 'entrada' ? 'Entrada' : 'Saída'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descrição do lançamento" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input type="number" min={0} step={0.01} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
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

function SummaryCard({ icon, label, value, bg, text }: { icon: React.ReactNode; label: string; value: string; bg: string; text: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 shadow-sm border`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-600">{label}</span></div>
      <p className={`text-lg font-bold ${text}`}>{value}</p>
    </div>
  )
}

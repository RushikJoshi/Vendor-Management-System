export default function Table({ headers = [], data = [], loading = false, renderRow, pagination }) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="vms-card overflow-hidden bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="vms-table-header backdrop-blur-sm"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-2 border-slate-200 border-t-vms-primary rounded-full animate-spin shadow-inner"></div>
                    <p className="text-vms-primary text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Syncing Node Registry...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                       <span className="text-2xl">📁</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Registry is currently empty</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="vms-table-row group">
                  {renderRow(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Dataset Index: <span className="text-vms-primary">1 - {rows.length}</span> of {pagination.total} ENTRIES
          </p>
          <div className="flex gap-2">
            <button className="vms-btn-outline px-4 py-1.5 text-[10px] bg-white hover:border-vms-primary" disabled={pagination.page === 1}>Previous Index</button>
            <button className="vms-btn-outline px-4 py-1.5 text-[10px] bg-white hover:border-vms-primary" disabled={pagination.page === pagination.pages}>Next Index</button>
          </div>
        </div>
      )}
    </div>
  );
}
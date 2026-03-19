export default function Table({ headers = [], data = [], loading = false, renderRow, pagination }) {
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E5E7EB]">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-[11px] font-bold text-[#1F2937] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E7EB]">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#0B5D3B]/20 border-t-[#0B5D3B] rounded-full animate-spin"></div>
                    <p className="text-[#1F2937] text-[10px] font-bold uppercase tracking-[0.2em]">Retrieving Records...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Registry is empty.</p>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#E8F5EE] transition-colors duration-200">
                  {renderRow(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="bg-gray-50 px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Showing {rows.length} of {pagination.total} Records
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-[4px] text-[10px] font-bold uppercase hover:bg-white disabled:opacity-50" disabled={pagination.page === 1}>Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded-[4px] text-[10px] font-bold uppercase hover:bg-white disabled:opacity-50" disabled={pagination.page === pagination.pages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
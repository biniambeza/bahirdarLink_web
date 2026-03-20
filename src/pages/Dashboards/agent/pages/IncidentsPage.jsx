const IncidentsPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Incidents</h2>

      <table className="w-full bg-white rounded-2xl shadow overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t">
            <td className="p-3">INC-1</td>
            <td className="p-3">Accident</td>
            <td className="p-3 text-red-500 font-semibold">Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IncidentsPage;

import React, { useEffect, useState } from 'react';

interface UnitStandard {
  id: string;
  title: string;
  level: number;
  credits: number;
  category: string;
}

export default function LearnershipOverviewView() {
  const [standards, setStandards] = useState<UnitStandard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/rosco/api/unit-standards')
      .then(res => res.json())
      .then(data => {
        setStandards(data.standards);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching standards:', err);
        setLoading(false);
      });
  }, []);

  const groupedStandards = standards.reduce((acc, std) => {
    if (!acc[std.category]) acc[std.category] = [];
    acc[std.category].push(std);
    return acc;
  }, {} as Record<string, UnitStandard[]>);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Learnership: General Security Practice (NQF Level 3)</h1>
      <p className="text-lg mb-6">
        The National Certificate: General Security Practice (SAQA ID 58577) is an entry-level learnership 
        designed to develop core competencies in security, including patrol, access control, asset protection, 
        and legal compliance. The qualification requires a minimum of 124 credits.
      </p>

      {(Object.entries(groupedStandards) as [string, UnitStandard[]][]).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{category} Unit Standards</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAQA ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

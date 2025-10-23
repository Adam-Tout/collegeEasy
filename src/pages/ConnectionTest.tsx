import { useState } from 'react';
import axios from 'axios';

export default function ConnectionTest() {
  const [domain, setDomain] = useState('camino.instructure.com');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const buildUrl = () => {
    const d = domain.trim().toLowerCase();
    if (d === 'camino.instructure.com') {
      return `/canvas/api/v1/users/self`;
    }
    return `https://${d}/api/v1/users/self`;
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const url = buildUrl();

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Accept': 'application/json',
        },
        withCredentials: false,
      });
      setResult(res.data);
    } catch (err: any) {
      const isAxios = !!err && !!err.isAxiosError;
      const status = isAxios ? err.response?.status : undefined;
      const data = isAxios ? err.response?.data : undefined;
      const isNetwork = isAxios && !err.response;
      const corsHint = isNetwork ? 'Network/CORS error: Browser requests to Canvas are likely blocked. Use the dev proxy (Camino) or a server-side proxy.' : '';
      const msg = isNetwork
        ? `Failed to reach Canvas at ${domain}. ${corsHint}`
        : `Canvas API error${status ? ` (${status})` : ''}: ${data?.errors?.[0]?.message || err.message || 'Unknown error'}`;
      setError(msg);
      setResult({
        url,
        status,
        data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow rounded p-4 space-y-4">
        <h1 className="text-xl font-semibold">Canvas Connection Test</h1>
        <p className="text-sm text-gray-600">Tests GET /api/v1/users/self using your domain and token.</p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Canvas Domain</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="camino.instructure.com"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Access Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste Canvas access token"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button onClick={testConnection} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && (
          <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            GET /api/whois
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Query Parameters</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Parameter</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Required</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">domain</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Yes</td>
                  <td className="py-2">
                    Domain name(s) to query (comma-separated)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Request Example</h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              {`curl "http://localhost:3000/api/whois?domain=example.com"`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Request Example (Multiple Domains)
            </h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              {`curl "http://localhost:3000/api/whois?domain=example.com,itea.dev"`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response Example</h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              {`{
  "example.com": {
    "found": true,
    "registrar": {
      "id": "TEST-REGISTRAR",
      "name": "Example Registrar",
      "email": "abuse@example.com"
    },
    "status": ["clientDeleteProhibited", "clientTransferProhibited"],
    "nameservers": ["ns1.example.com", "ns2.example.com"],
    "ts": {
      "created": "2020-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z",
      "expires": "2025-01-01T00:00:00.000Z"
    }
  },
  "itea.dev": {
    "found": true,
    "registrar": {
      "id": "DEV-REGISTRAR",
      "name": "Dev Registrar"
    },
    "status": [],
    "nameservers": [],
    "ts": {}
  }
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response Fields</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Field</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">found</td>
                  <td className="py-2">boolean</td>
                  <td className="py-2">Whether domain was found</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">registrar</td>
                  <td className="py-2">object</td>
                  <td className="py-2">Registrar information</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">registrar.id</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Registrar ID</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">registrar.name</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Registrar name</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">registrar.email</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Registrar abuse contact email</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">status</td>
                  <td className="py-2">string[]</td>
                  <td className="py-2">EPP status codes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">nameservers</td>
                  <td className="py-2">string[]</td>
                  <td className="py-2">List of name servers</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">ts.created</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Registration creation date</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">ts.updated</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Last update date</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">ts.expires</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Expiration date</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Error Responses</h3>
            <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              {`// 400 - Bad Request
{ "error": "Invalid domain format" }

// 500 - Server Error
{ "error": "Query failed, please try again later" }`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Supports batch queries with comma-separated domain names</p>
          <p>2. API uses RDAP and WHOIS protocols for lookups</p>
          <p>3. Response data is normalized</p>
          <p>4. Current version only supports domain names, not IP addresses</p>
        </CardContent>
      </Card>
    </div>
  );
}

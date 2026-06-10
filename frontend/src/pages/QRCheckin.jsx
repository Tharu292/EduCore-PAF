import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { QrReader } from "react-qr-reader";

export default function QRCheckin() {
  const [data, setData] = useState("");
  const [error, setError] = useState("");

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900">QR Check-in</h1>
        <p className="text-zinc-500 mt-2">
          Scan the booking QR code from the approved booking email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, err) => {
              if (result) {
                setData(result?.text || "");
                setError("");
              }
              if (err) {
                setError("");
              }
            }}
            className="w-full"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Verification Result
          </h2>

          {data ? (
            <pre className="whitespace-pre-wrap text-sm bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-zinc-800">
              {data}
            </pre>
          ) : (
            <p className="text-zinc-500">No QR scanned yet.</p>
          )}

          {error && <p className="text-red-600 mt-3">{error}</p>}
        </div>
      </div>
    </AppLayout>
  );
}
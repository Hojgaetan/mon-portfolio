/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { createOperation, getBalance, getTransactionStatus, listPendingBills, listServices, getErrors } from "@/lib/intech";

function randExtId() {
  return `EXT_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

const IntechDemo: React.FC = () => {
  const [services, setServices] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [resp, setResp] = useState<any>(null);
  const [statusResp, setStatusResp] = useState<any>(null);
  const [errorsCatalog, setErrorsCatalog] = useState<any>(null);

  const [cashPhone, setCashPhone] = useState("");
  const [cashAmount, setCashAmount] = useState<number>(100);
  const [cashService, setCashService] = useState<string>("WAVE_SN_API_CASH_IN");
  const [extId, setExtId] = useState<string>(randExtId());

  const [waPhone, setWaPhone] = useState("+221772457199");
  const [waMessage, setWaMessage] = useState("Hello from IntechDemo");
  const [waFile, setWaFile] = useState<File | null>(null);

  const [billService, setBillService] = useState<string>("SENELEC_SN_BILL_PAY");
  const [billAccountNumber, setBillAccountNumber] = useState<string>("");
  const [pending, setPending] = useState<any[]>([]);
  const [billReference, setBillReference] = useState<string>("");

  const cashinCodes = useMemo(() => [
    "WAVE_SN_API_CASH_IN",
    "ORANGE_SN_API_CASH_IN",
    "WIZALL_SN_API_CASH_IN",
    "FREE_SN_WALLET_CASH_IN",
    "EXPRESSO_SN_WALLET_CASH_IN",
  ], []);

  const billPayCodes = useMemo(() => [
    "SENELEC_SN_BILL_PAY",
    "SENEAU_SN_BILL_PAY",
    "AQUATECH_SN_BILL_PAY",
    "UVS_SN_BILL_PAY",
    "UCAD_SN_BILL_PAY",
  ], []);

  async function handleLoadServices() {
    const s = await listServices();
    setServices(s);
  }

  async function handleBalance() {
    const b = await getBalance();
    setBalance(b);
  }

  async function handleErrors() {
    const e = await getErrors();
    setErrorsCatalog(e);
  }

  async function handleCashIn() {
    const res = await createOperation({
      phone: cashPhone,
      amount: Number(cashAmount),
      codeService: cashService,
      externalTransactionId: extId,
      data: {},
    });
    setResp(res);
  }

  async function handleListBills() {
    const r = await listPendingBills({ codeService: billService, billAccountNumber });
    const list = r?.data?.pendingBills?.pendingBills || [];
    setPending(list);
    if (list[0]?.billReference) setBillReference(list[0].billReference);
  }

  async function handleBillPay() {
    const res = await createOperation({
      phone: cashPhone,
      amount: Number(cashAmount),
      codeService: billService,
      externalTransactionId: extId,
      data: {},
      billReference,
      billAccountNumber,
    } as any);
    setResp(res);
  }

  async function handleWhatsApp() {
    let attachedMedia: string | undefined = undefined;
    let ext: string | undefined = undefined;
    let name: string | undefined = undefined;
    if (waFile) {
      attachedMedia = await fileToBase64(waFile);
      const dot = waFile.name.lastIndexOf(".");
      ext = dot >= 0 ? waFile.name.slice(dot) : "";
      name = waFile.name;
    }
    const res = await createOperation({
      phone: waPhone,
      codeService: "WHATSAPP_MESSAGING",
      externalTransactionId: extId,
      data: {},
      message: waMessage,
      ...(attachedMedia ? {
        attachedMedia,
        attachedMediaExtension: ext,
        attachedMediaName: name,
      } : {}),
    } as any);
    setResp(res);
  }

  async function handleStatus() {
    const r = await getTransactionStatus(extId);
    setStatusResp(r);
  }

  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const list = errorsCatalog?.services || errorsCatalog?.data?.services || [];
    if (Array.isArray(list)) {
      for (const e of list) {
        if (e?.code) map[e.code] = e?.message ?? "";
      }
    }
    return map;
  }, [errorsCatalog]);

  // Helpers to render mapped error from response structures similar to collection
  function renderOpErrorBlock() {
    const code = resp?.data?.errorType?.code;
    const msgFromCatalog = code ? errorMap[code] : undefined;
    const apiMsg = resp?.msg;
    if (!code && !apiMsg) return null;
    return (
      <div className="mt-3 p-3 rounded border border-red-500/50 bg-red-500/10 text-red-200">
        <div className="font-semibold">Erreur opération</div>
        {code && <div>code: <span className="font-mono">{code}</span></div>}
        {msgFromCatalog && <div>message (catalogue): {msgFromCatalog}</div>}
        {!msgFromCatalog && apiMsg && <div>message (API): {apiMsg}</div>}
      </div>
    );
  }

  function renderStatusErrorBlock() {
    const code = statusResp?.data?.errorType?.code;
    const msgFromCatalog = code ? errorMap[code] : undefined;
    const apiMsg = statusResp?.msg;
    if (!code && !apiMsg) return null;
    return (
      <div className="mt-3 p-3 rounded border border-yellow-500/50 bg-yellow-500/10 text-yellow-200">
        <div className="font-semibold">Erreur statut</div>
        {code && <div>code: <span className="font-mono">{code}</span></div>}
        {msgFromCatalog && <div>message (catalogue): {msgFromCatalog}</div>}
        {!msgFromCatalog && apiMsg && <div>message (API): {apiMsg}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Intech Demo</h1>

      <section className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={handleLoadServices}>Lister services</button>
          <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={handleBalance}>Solde</button>
          <button className="px-3 py-2 bg-fuchsia-600 text-white rounded" onClick={handleErrors}>Catalogue d’erreurs</button>
        </div>
        {services && <pre className="bg-black/80 text-green-200 p-3 rounded overflow-auto max-h-64">{JSON.stringify(services, null, 2)}</pre>}
        {balance && <pre className="bg-black/80 text-green-200 p-3 rounded overflow-auto max-h-64">{JSON.stringify(balance, null, 2)}</pre>}
        {errorsCatalog && <pre className="bg-black/80 text-pink-200 p-3 rounded overflow-auto max-h-64">{JSON.stringify(errorsCatalog, null, 2)}</pre>}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">CASH IN</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="border rounded p-2" placeholder="Téléphone (ex: 772457199)" value={cashPhone} onChange={e=>setCashPhone(e.target.value)} />
          <input className="border rounded p-2" placeholder="Montant" type="number" value={cashAmount} onChange={e=>setCashAmount(Number(e.target.value))} />
          <select className="border rounded p-2" value={cashService} onChange={e=>setCashService(e.target.value)}>
            {cashinCodes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={handleCashIn}>Initier</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">BILL PAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select className="border rounded p-2" value={billService} onChange={e=>setBillService(e.target.value)}>
            {billPayCodes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border rounded p-2" placeholder="billAccountNumber" value={billAccountNumber} onChange={e=>setBillAccountNumber(e.target.value)} />
          <button className="px-3 py-2 bg-teal-600 text-white rounded" onClick={handleListBills}>Lister factures</button>
          <select className="border rounded p-2" value={billReference} onChange={e=>setBillReference(e.target.value)}>
            <option value="">--billReference--</option>
            {pending.map((b, i) => <option key={i} value={b.billReference}>{b.billReference} ({b.amount})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border rounded p-2" placeholder="Téléphone payeur" value={cashPhone} onChange={e=>setCashPhone(e.target.value)} />
          <input className="border rounded p-2" placeholder="Montant" type="number" value={cashAmount} onChange={e=>setCashAmount(Number(e.target.value))} />
          <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={handleBillPay} disabled={!billReference}>Payer</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">WhatsApp</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="border rounded p-2" placeholder="Téléphone international (+221...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} />
          <input className="border rounded p-2" placeholder="Message" value={waMessage} onChange={e=>setWaMessage(e.target.value)} />
          <input className="border rounded p-2" type="file" onChange={e=>setWaFile(e.target.files?.[0] || null)} />
          <button className="px-3 py-2 bg-amber-600 text-white rounded" onClick={handleWhatsApp}>Envoyer</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Suivi transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border rounded p-2" value={extId} onChange={e=>setExtId(e.target.value)} />
          <button className="px-3 py-2 bg-gray-700 text-white rounded" onClick={()=>setExtId(randExtId())}>Nouveau externalTransactionId</button>
          <button className="px-3 py-2 bg-slate-600 text-white rounded" onClick={handleStatus}>Vérifier statut</button>
        </div>
      </section>

      {resp && <section>
        <h3 className="font-semibold">Réponse Operation</h3>
        <pre className="bg-black/80 text-green-200 p-3 rounded overflow-auto max-h-80">{JSON.stringify(resp, null, 2)}</pre>
        {resp?.data?.deepLinkUrl && (
          <a className="text-blue-400 underline" href={resp.data.deepLinkUrl} target="_blank">Ouvrir deepLinkUrl</a>
        )}
        {resp?.data?.authLinkUrl && (
          <a className="text-blue-400 underline ml-4" href={resp.data.authLinkUrl} target="_blank">Ouvrir authLinkUrl</a>
        )}
        {renderOpErrorBlock()}
      </section>}

      {statusResp && <section>
        <h3 className="font-semibold">Réponse Statut</h3>
        <pre className="bg-black/80 text-green-200 p-3 rounded overflow-auto max-h-80">{JSON.stringify(statusResp, null, 2)}</pre>
        {renderStatusErrorBlock()}
      </section>}
    </div>
  );
};

export default IntechDemo;

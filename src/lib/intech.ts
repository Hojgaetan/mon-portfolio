/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

export type IntechOperationPayload = Record<string, any> & {
  phone?: string;
  amount?: number;
  codeService: string;
  externalTransactionId: string;
  callbackUrl?: string;
  data?: any;
};

export async function listServices() {
  const { data, error } = await supabase.functions.invoke("intech-services", { body: null });
  if (error) throw error;
  return data as any;
}

export async function getBalance() {
  const { data, error } = await supabase.functions.invoke("intech-balance", { body: {} });
  if (error) throw error;
  return data as any;
}

export async function listPendingBills(opts: { codeService: string; billAccountNumber: string; }) {
  const { data, error } = await supabase.functions.invoke("intech-pending-bills", {
    body: opts,
  });
  if (error) throw error;
  return data as any;
}

export async function createOperation(payload: IntechOperationPayload) {
  const { data, error } = await supabase.functions.invoke("intech-operation", {
    body: payload,
  });
  if (error) throw error;
  return data as any;
}

export async function getTransactionStatus(externalTransactionId: string) {
  const { data, error } = await supabase.functions.invoke("intech-transaction-status", {
    body: { externalTransactionId },
  });
  if (error) throw error;
  return data as any;
}

export async function getErrors() {
  const { data, error } = await supabase.functions.invoke("intech-errors", { body: {} });
  if (error) throw error;
  return data as any;
}

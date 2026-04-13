/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from "react";
import procurementApi from "../services/procurementApi";

export const ProcurementContext = createContext();

export function ProcurementProvider({ children }) {
  const [overview, setOverview] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [slaBreaches, setSlaBreaches] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        prRes,
        poRes,
        deliveryRes,
        invoiceRes,
        paymentRes,
        slaRes,
      ] = await Promise.all([
        procurementApi.getOverview(),
        procurementApi.listPRs(),
        procurementApi.listPOs(),
        procurementApi.listDeliveries(),
        procurementApi.listInvoices(),
        procurementApi.listPayments(),
        procurementApi.listSlaBreaches(),
      ]);
      setOverview(overviewRes.data.data || null);
      setPurchaseRequests(prRes.data.data || []);
      setPurchaseOrders(poRes.data.data || []);
      setDeliveries(deliveryRes.data.data || []);
      setInvoices(invoiceRes.data.data || []);
      setPayments(paymentRes.data.data || []);
      setSlaBreaches(slaRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      loading,
      overview,
      purchaseRequests,
      purchaseOrders,
      deliveries,
      invoices,
      payments,
      slaBreaches,
      refreshAll,
    }),
    [loading, overview, purchaseRequests, purchaseOrders, deliveries, invoices, payments, slaBreaches, refreshAll]
  );

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

import { createContext, useCallback, useMemo, useState, useContext } from "react";
import procurementApi from "../services/procurementApi";
import { AuthContext } from "./AuthContext";
import { normalizeRole } from "../config/roles";

export const ProcurementContext = createContext();

export function ProcurementProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [slaBreaches, setSlaBreaches] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const role = normalizeRole(user.role);
    const isAdminSide = ["admin", "finance", "procurement", "hr"].includes(role);

    try {
      const safeFetch = async (promise, defaultVal) => {
        try {
          return await promise;
        } catch (error) {
          return { data: { data: defaultVal } };
        }
      };

      const [
        overviewRes,
        prRes,
        poRes,
        soRes,
        deliveryRes,
        invoiceRes,
        paymentRes,
        slaRes,
      ] = await Promise.all([
        isAdminSide ? safeFetch(procurementApi.getOverview(), null) : Promise.resolve({ data: { data: null } }),
        isAdminSide ? safeFetch(procurementApi.listPRs(), []) : Promise.resolve({ data: { data: [] } }),
        safeFetch(procurementApi.listPOs(), []),
        safeFetch(procurementApi.listSOs(), []),
        safeFetch(procurementApi.listDeliveries(), []),
        safeFetch(procurementApi.listInvoices(), []),
        isAdminSide ? safeFetch(procurementApi.listPayments(), []) : Promise.resolve({ data: { data: [] } }),
        isAdminSide ? safeFetch(procurementApi.listSlaBreaches(), []) : Promise.resolve({ data: { data: [] } }),
      ]);

      setOverview(overviewRes.data.data || null);
      setPurchaseRequests(prRes.data.data || []);
      setPurchaseOrders(poRes.data.data || []);
      setServiceOrders(soRes.data.data || []);
      setDeliveries(deliveryRes.data.data || []);
      setInvoices(invoiceRes.data.data || []);
      setPayments(paymentRes.data.data || []);
      setSlaBreaches(slaRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      loading,
      overview,
      purchaseRequests,
      purchaseOrders,
      serviceOrders,
      deliveries,
      invoices,
      payments,
      slaBreaches,
      refreshAll,
    }),
    [loading, overview, purchaseRequests, purchaseOrders, serviceOrders, deliveries, invoices, payments, slaBreaches, refreshAll]
  );

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

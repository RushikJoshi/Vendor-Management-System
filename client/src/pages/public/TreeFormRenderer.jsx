import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

const flattenNodes = (nodes, prefix = "", acc = []) => {
  nodes.forEach((node, idx) => {
    const current = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    acc.push({ ...node, number: current });
    flattenNodes(node.children || [], current, acc);
  });
  return acc;
};

const MOCK_CATEGORIES = [
    "ALL (ALL) > Material (Material) > GENERAL CONSUMABLES (ZCON) > IT CONSUMABLE (120004) > CABLE MANAGER (13004011)",
    "ALL (ALL) > Material (Material) > ASSET MATERIAL (ZAST) > IT EQUIPMENT (130002) > MANAGED SWITCH 24 PORT (12000935)",
    "ALL (ALL) > Material (Material) > ASSET MATERIAL (ZAST) > IT EQUIPMENT (130002) > MANAGED SWITCH 48 PORT (12000936)",
    "ALL (ALL) > Material (Material) > GENERAL CONSUMABLES (ZCON) > IT CONSUMABLE (120004) > WIRE MANAGEMENT BOX (13006717)",
    "ALL (ALL) > Civil (Civil) > ROAD UTILITY > PAVEMENT > BITUMINOUS MIX",
    "ALL (ALL) > Civil (Civil) > ROAD UTILITY > EARTHWORK > EMBANKMENT",
    "ALL (ALL) > Civil (Civil) > ROAD UTILITY > DRAINAGE > RCC PIPES",
    "ALL (ALL) > Civil (Civil) > INFRASTRUCTURE > BRIDGE > STEEL STRUCTURES",
    "ALL (ALL) > Civil (Civil) > INFRASTRUCTURE > BRIDGE > EXPANSION JOINT",
    "ALL (ALL) > Civil (Civil) > BULK MATERIAL > AGGREGATES > CRUSHED STONE",
    "ALL (ALL) > Civil (Civil) > BULK MATERIAL > REINFORCEMENT > TMT BARS",
    "ALL (ALL) > Mechanical (Mech) > PLANT & MACHINERY > SPARES > HYDRAULIC PUMP",
    "ALL (ALL) > Mechanical (Mech) > PLANT & MACHINERY > CONSUMABLES > ENGINE OIL",
    "ALL (ALL) > Electrical (Elec) > SUBSTATION > SWITCHGEAR > TRANSFORMER",
    "ALL (ALL) > Electrical (Elec) > WIRING > CABLES > ARMOURED CABLE",
    "ALL (ALL) > Services (Services) > CONSULTANCY > DESIGN > ARCHITECTURAL",
    "ALL (ALL) > Services (Services) > LOGISTICS > FREIGHT > INTERNATIONAL",
    "ALL (ALL) > Services (Services) > LOGISTICS > TRANSPORT > LOCAL TRUCKING",
    "ALL (ALL) > Services (Services) > MANPOWER > SKILLED > ROAD CONSTRUCTION",
    "ALL (ALL) > Services (Services) > TESTING > LAB > SOIL TESTING",
    "ALL (ALL) > Material (Material) > FUEL & LUBRICANTS > DIESEL > BULK SUPPLY",
    "ALL (ALL) > Material (Material) > CONSTRUCTION MATERIAL > CEMENT > OPC 43 GRADE",
    "ALL (ALL) > Material (Material) > CONSTRUCTION MATERIAL > CEMENT > PPC GRADE",
    "ALL (ALL) > Safety (HSE) > PPE > FOOTWEAR > SAFETY SHOES",
    "ALL (ALL) > Safety (HSE) > FIRE FIGHTING > EXTINGUISHER > CO2 TYPE"
];

const MOCK_REGIONS = [
    "INDIA (IN) > Rajasthan > Jaipur",
    "INDIA (IN) > Rajasthan > Udaipur",
    "INDIA (IN) > Rajasthan > Jodhpur",
    "INDIA (IN) > Rajasthan > Ajmer",
    "INDIA (IN) > Rajasthan > Kota",
    "INDIA (IN) > Maharashtra > Mumbai",
    "INDIA (IN) > Maharashtra > Pune",
    "INDIA (IN) > Maharashtra > Nagpur",
    "INDIA (IN) > Maharashtra > Nashik",
    "INDIA (IN) > Gujarat > Ahmedabad",
    "INDIA (IN) > Gujarat > Surat",
    "INDIA (IN) > Gujarat > Vadodara",
    "INDIA (IN) > Delhi > NCR",
    "INDIA (IN) > Haryana > Gurugram",
    "INDIA (IN) > Haryana > Faridabad",
    "INDIA (IN) > Haryana > Panipat",
    "INDIA (IN) > Uttar Pradesh > Noida",
    "INDIA (IN) > Uttar Pradesh > Ghaziabad",
    "INDIA (IN) > Uttar Pradesh > Lucknow",
    "INDIA (IN) > Uttar Pradesh > Kanpur",
    "INDIA (IN) > Karnataka > Bengaluru",
    "INDIA (IN) > Karnataka > Mysuru",
    "INDIA (IN) > Telangana > Hyderabad",
    "INDIA (IN) > Tamil Nadu > Chennai",
    "INDIA (IN) > Tamil Nadu > Coimbatore",
    "INDIA (IN) > West Bengal > Kolkata",
    "INDIA (IN) > Madhya Pradesh > Indore",
    "INDIA (IN) > Madhya Pradesh > Bhopal",
    "INDIA (IN) > Punjab > Ludhiana",
    "INDIA (IN) > Punjab > Mohali",
    "INDIA (IN) > Andhra Pradesh > Vijayawada",
    "INDIA (IN) > Bihar > Patna"
];

const CategoryAutocomplete = ({ value, onChange, placeholder, required, type = "category" }) => {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef(null);

    const mockData = type === "region" ? MOCK_REGIONS : MOCK_CATEGORIES;

    useEffect(() => { setQuery(value || ""); }, [value]);

    useEffect(() => {
        if (query.length > 0) {
            const matches = mockData.filter(c => c.toLowerCase().includes(query.toLowerCase()));
            setResults(matches);
        } else {
            setResults(mockData);
        }
    }, [query, mockData]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setShowResults(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative group w-full" ref={containerRef}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    required={required}
                    value={query}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => { setQuery(e.target.value); if (!e.target.value) onChange(""); }}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 pr-12"
                />
                <div className="absolute right-0 h-full w-12 flex items-center justify-center border-l border-slate-200 bg-slate-50 group-hover:bg-slate-100 cursor-pointer rounded-r-xl">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-slate-300 shadow-2xl z-[1000] max-h-[300px] overflow-y-auto mt-1 rounded-xl">
                    {results.map((res, idx) => {
                        const parts = res.split(' > ');
                        const mainPath = parts.slice(0, -1).join(' > ');
                        const endTerm = parts[parts.length - 1];

                        return (
                            <div 
                                key={idx}
                                onClick={() => { setQuery(res); onChange(res); setShowResults(false); }}
                                className="px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors group flex flex-col gap-0.5"
                            >
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    {mainPath} {parts.length > 1 ? '>' : ''}
                                </p>
                                <p className="text-[12px] font-black text-blue-700 uppercase tracking-tight">
                                    {endTerm}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

function TreeNodeRenderer({ node, number, values, files, setValues, setFiles, collapsed, setCollapsed }) {
  const key = node.id;
  const defaultCollapsed = false; // Always open by default or rely on config
  const isCollapsed = collapsed[key] ?? defaultCollapsed;
  const isTopLevel = !number.includes(".");

  // ==========================================
  // HARDCODED BUSINESS LOGIC VISIBILITY CHECKS
  // ==========================================
  if (node.title?.includes("1.1.2.2.") && values["fillAdditional"] !== "Yes") {
      return null;
  }

  return (
    <div className={`w-full overflow-hidden transition-all ${isTopLevel ? "" : "mt-2 rounded-2xl border border-slate-200 bg-white"}`}>
      <div 
        className={`flex items-center gap-3 cursor-pointer py-4 transition-colors ${
           isTopLevel 
            ? "px-1 border-b border-slate-200" 
            : "px-5 hover:bg-slate-50"
        }`}
        onClick={() => setCollapsed((p) => ({ ...p, [key]: !isCollapsed }))}
      >
        <span className={`flex items-center text-slate-400 ${isTopLevel ? "" : "text-blue-500"}`}>
            {isCollapsed ? "→" : "↓"}
        </span>
        <span className={`font-semibold tracking-tight ${isTopLevel ? "text-lg text-slate-900" : "text-[13px] text-blue-700"}`}>
            {node.title}
        </span>
      </div>

      {!isCollapsed ? (
        <div className={`transition-all ${isTopLevel ? "pt-2" : "border-t border-slate-100 p-5 bg-slate-50/30"}`}>
          {node.fields && node.fields.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
              {node.fields.map((field) => (
                <FieldRenderer key={field.id} field={field} values={values} files={files} setValues={setValues} setFiles={setFiles} />
              ))}
            </div>
          )}
          
          {node.children && node.children.length > 0 && (
            <div className="flex flex-col gap-2">
              {node.children.map((child, idx) => (
                <TreeNodeRenderer
                  key={child.id}
                  node={child}
                  number={`${number}.${idx + 1}`}
                  values={values}
                  files={files}
                  setValues={setValues}
                  setFiles={setFiles}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FieldRenderer({ field, values, files, setValues, setFiles }) {
  const setValue = (v) => setValues((p) => ({ ...p, [field.id]: v }));
  const current = values[field.id] ?? (field.type === "checkbox" ? [] : "");
  const isWideField = field.type === "checkbox" || field.type === "radio" || field.type === "file";
  const wideSpanClass = isWideField ? "md:col-span-2 xl:col-span-3" : "";
  const pattern = field.validation?.pattern;
  const hintText = pattern === "gst" ? "Format: 22AAAAA0000A1Z5" : pattern === "ifsc" ? "Format: HDFC0001234" : "";
  const inputBaseClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

  // ==========================================
  // HARDCODED FIELD DEPENDENCY VISIBILITY
  // ==========================================
  if (field.id === "panNum" && values["panStatus"] !== "Available") return null;
  if (field.id === "pfNo" && values["pfStatus"] !== "Yes") return null;
  if (field.id === "esiNo" && values["esiStatus"] !== "Yes") return null;

  if (field.type === "dropdown" || field.type === "radio") {
    if (field.type === "dropdown") {
      return (
        <div className={`space-y-1 ${wideSpanClass}`}>
          <label className="text-xs font-semibold tracking-wide text-slate-700">
            {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
          </label>
          <select className={inputBaseClass} value={current} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
              <input type="radio" name={field.id} checked={current === opt} onChange={() => setValue(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={(current || []).includes(opt)}
                onChange={(e) => {
                  const next = new Set(current || []);
                  if (e.target.checked) next.add(opt);
                  else next.delete(opt);
                  setValue(Array.from(next));
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={`space-y-1 ${wideSpanClass}`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <input
          type="file"
          className={`${inputBaseClass} file:mr-3 file:rounded-lg file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-stone-800`}
          onChange={(e) => setFiles((p) => ({ ...p, [field.id]: e.target.files?.[0] || null }))}
        />
        {files[field.id]?.name ? <p className="text-xs text-slate-500">Selected: {files[field.id].name}</p> : null}
      </div>
    );
  }

  const handleInputChange = (e) => {
    let val = e.target.value;
    const labelLo = field.label?.toLowerCase() || "";

    // 1. MOBILE / CONTACT / PHONE: Only allow numbers, max 15
    if (labelLo.includes("mobile") || labelLo.includes("phone") || labelLo.includes("alternate")) {
      val = val.replace(/\D/g, "").slice(0, 15);
    }
    // 2. GST: Alphanumeric, max 15, uppercase
    else if (labelLo.includes("gst")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
    }
    // 3. PAN: Alphanumeric, max 10, uppercase
    else if (labelLo.includes("pan")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
    }
    // 4. CIN: Alphanumeric, max 21, uppercase
    else if (labelLo.includes("cin")) {
      val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 21);
    }
    // 5. MSME / UDYAM: Allow Alphanumeric + Hyphens, max 19, uppercase
    else if (labelLo.includes("msme") || labelLo.includes("udyam")) {
      val = val.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase().slice(0, 19);
    }

    setValue(val);
  };

  return (
    <div className={`space-y-1 ${wideSpanClass}`}>
      <label className="text-xs font-semibold tracking-wide text-slate-700">
        {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
      </label>
      {field.type === "text" && field.label.includes("Category") ? (
        <CategoryAutocomplete
            required={field.required}
            placeholder={field.placeholder || "Search Category (e.g., CIVIL BULK > ROAD UTILITY)"}
            value={current}
            onChange={setValue}
        />
      ) : field.type === "text" && field.label.includes("Region") ? (
        <CategoryAutocomplete
            required={field.required}
            placeholder={field.placeholder || "Search Region (e.g., INDIA > Rajasthan > Jaipur)"}
            value={current}
            onChange={setValue}
            type="region"
        />
      ) : (
          <input
            type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
            className={inputBaseClass}
            placeholder={field.placeholder || ""}
            value={current}
            onChange={handleInputChange}
          />
      )}
      {hintText ? <p className="text-[11px] text-slate-500">{hintText}</p> : null}
    </div>
  );
}

export default function TreeFormRenderer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const draftStorageKey = useMemo(() => `tree_form_draft_${id}`, [id]);
  const previousAutofillValuesRef = useRef({});
  const requestedAutofillValuesRef = useRef({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${apiBase}/form/${id}`);
        setForm(res.data.data);
        
        if (token) {
            try {
                const tokenRes = await axios.get(`${apiBase}/invitations/verify/${token}`);
                const inviteEmail = tokenRes.data?.data?.email;
                if (inviteEmail) {
                    const allNodes = flattenNodes(res.data.data.structure || []);
                    const emailField = allNodes.flatMap(n => n.fields || []).find(f => /email/i.test(f.label));
                    if (emailField) {
                        setValues(p => ({ ...p, [emailField.id]: inviteEmail }));
                    }
                }
            } catch (err) {
                 console.error("Invalid token", err);
            }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load form");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!form) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const savedValues = parsed?.values;
      if (!savedValues || typeof savedValues !== "object") return;
      setValues(savedValues);
      setSuccess("Saved draft restored.");
    } catch {}
  }, [form, draftStorageKey]);

  const topSections = useMemo(() => form?.structure || [], [form]);

  const autoFillFromApi = async (field, value) => {
    const pattern = field.validation?.pattern || "none";
    const label = field.label?.toLowerCase() || "";
    const normalizedValue = String(value || "").trim().toUpperCase();
    if (!normalizedValue) return;

    if (pattern === "gst" && GST_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.post(`${apiBase}/form/autofill/gst`, { gstNumber: normalizedValue });
        const company = res.data?.data?.companyName || "";
        if (company) {
          const allNodes = flattenNodes(form?.structure || []);
          const candidate = allNodes
            .flatMap((n) => n.fields || [])
            .find((f) => /company name/i.test(f.label) || /company_name/i.test(f.id));
          if (candidate) {
            setValues((p) => {
              if (p[candidate.id] === company) return p;
              return { ...p, [candidate.id]: company };
            });
          }
        }
      } catch {}
    }
    if (pattern === "ifsc" && IFSC_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.get(`https://ifsc.razorpay.com/${normalizedValue}`);
        const bank = res.data?.BANK || "";
        const branch = res.data?.BRANCH || "";
        const allNodes = flattenNodes(form?.structure || []);
        const bankField = allNodes.flatMap((n) => n.fields || []).find((f) => /bank name/i.test(f.label));
        const branchField = allNodes.flatMap((n) => n.fields || []).find((f) => /branch/i.test(f.label));
        setValues((p) => ({ 
          ...p, 
          ...(bankField && bank ? { [bankField.id]: bank } : {}),
          ...(branchField && branch ? { [branchField.id]: branch } : {})
        }));
      } catch {}
    }
    
    // PINCODE AUTOFILL
    if (label.includes("pincode") && PINCODE_REGEX.test(normalizedValue)) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${normalizedValue}`);
        const data = res.data?.[0];
        if (data?.Status === "Success") {
            const first = data.PostOffice?.[0];
            const city = first?.District || first?.Block || "";
            const state = first?.State || "";
            
            const allNodes = flattenNodes(form?.structure || []);
            const cityField = allNodes.flatMap((n) => n.fields || []).find((f) => /city/i.test(f.label));
            const stateField = allNodes.flatMap((n) => n.fields || []).find((f) => /state/i.test(f.label));
            
            setValues((p) => ({
                ...p,
                ...(cityField && city ? { [cityField.id]: city } : {}),
                ...(stateField && state ? { [stateField.id]: state } : {})
            }));
        }
      } catch {}
    }

    // CITY TO PINCODE AUTOFILL
    if (label.includes("city") && normalizedValue.length > 3) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/postoffice/${normalizedValue}`);
        const data = res.data?.[0];
        if (data?.Status === "Success") {
            const first = data.PostOffice?.[0];
            const pincode = first?.Pincode || "";
            const state = first?.State || "";
            
            const allNodes = flattenNodes(form?.structure || []);
            const pinField = allNodes.flatMap((n) => n.fields || []).find((f) => /pincode/i.test(f.label));
            const stateField = allNodes.flatMap((n) => n.fields || []).find((f) => /state/i.test(f.label));
            
            setValues((p) => ({
                ...p,
                ...(pinField && pincode && !p[pinField.id] ? { [pinField.id]: pincode } : {}),
                ...(stateField && state && !p[stateField.id] ? { [stateField.id]: state } : {})
            }));
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (!form) return;
    const allNodes = flattenNodes(form.structure || []);
    allNodes.forEach((node) => {
      (node.fields || []).forEach((field) => {
        const pattern = field.validation?.pattern;
        const label = field.label?.toLowerCase() || "";
        
        if (pattern !== "gst" && pattern !== "ifsc" && !label.includes("pincode") && !label.includes("city")) return;

        const current = String(values[field.id] || "").trim().toUpperCase();
        const previous = String(previousAutofillValuesRef.current[field.id] || "").trim().toUpperCase();

        if (!current || current === previous) return;

        let isValid = false;
        if (pattern === "gst") isValid = GST_REGEX.test(current);
        else if (pattern === "ifsc") isValid = IFSC_REGEX.test(current);
        else if (label.includes("pincode")) isValid = PINCODE_REGEX.test(current);
        else if (label.includes("city")) isValid = current.length > 3;

        if (!isValid) return;

        if (requestedAutofillValuesRef.current[field.id] === current) return;
        requestedAutofillValuesRef.current[field.id] = current;
        autoFillFromApi(field, current);
      });
    });

    const snapshot = {};
    allNodes.forEach((node) => {
      (node.fields || []).forEach((field) => {
        if (field.validation?.pattern === "gst" || field.validation?.pattern === "ifsc") {
          snapshot[field.id] = values[field.id];
        }
      });
    });
    previousAutofillValuesRef.current = snapshot;
  }, [values, form]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("formId", id);
      if (token) {
          formData.append("invitationToken", token);
      }
      formData.append("payload", JSON.stringify({ values }));
      Object.entries(files).forEach(([fieldId, file]) => {
        if (file) formData.append(`file_${fieldId}`, file);
      });

      const res = await axios.post(`${apiBase}/form/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.removeItem(draftStorageKey);
      setSuccess(`Submitted successfully. ID: ${res.data.data._id}`);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs?.join(" | ") || err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          formId: id,
          updatedAt: new Date().toISOString(),
          values,
        })
      );
      setError("");
      setSuccess("Draft saved.");
    } catch {
      setError("Could not save draft.");
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!form) return <div className="p-6 text-rose-600">{error || "Form not found"}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div>
                <h1 className="text-[14px] font-black tracking-tight text-[#1e1e1e] uppercase">{form.name}</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">{form.description || "Vendor Onboarding Portal"}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
                <span className="text-[10px] font-bold tracking-widest text-[#1e1e1e] uppercase">Portal Active</span>
                <span className="h-4 w-px bg-slate-300"></span>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">V3.0</span>
            </div>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
                <div className="space-y-6">
                {topSections.map((section, idx) => (
                    <TreeNodeRenderer
                        key={section.id}
                        node={section}
                        number={`${idx + 1}`}
                        values={values}
                        files={files}
                        setValues={setValues}
                        setFiles={setFiles}
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                    />
                ))}
                </div>
            </div>
        </main>

        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-8 sticky bottom-0 z-40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={saveDraft}
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
            >
              Save Draft
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full sm:w-auto rounded-lg bg-blue-700 px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-700/30 transition-all hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </div>

        {(error || success) && (
            <div className="fixed bottom-24 right-8 z-50 max-w-sm">
                {error && <p className="mb-2 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700 shadow-xl">{error}</p>}
                {success && <p className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-700 shadow-xl">{success}</p>}
            </div>
        )}
      </div>
  );
}

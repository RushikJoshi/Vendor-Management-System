import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const isPostalLabel = (label = "") => {
  const normalized = String(label).toLowerCase();
  return normalized.includes("pincode") || normalized.includes("postal") || normalized.includes("zip");
};
const pickPostalValue = (...candidates) => {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value) continue;
    if (/^(na|n\/a|null)$/i.test(value)) continue;
    return value;
  }
  return "";
};
const formatPostalRegionValue = (fieldLabel = "", stateValue = "") => {
  const normalized = String(fieldLabel || "").toLowerCase();
  if (normalized.includes("country") && normalized.includes("region")) {
    return stateValue ? `INDIA (IN) > ${stateValue}` : "INDIA (IN)";
  }
  if (normalized.includes("country")) return "India";
  return stateValue;
};

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

const CategoryAutocomplete = ({ value, onChange, placeholder, required, type = "category", parentPath = "" }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedLevels, setSelectedLevels] = useState([]);
    const containerRef = useRef(null);

    const mockData = useMemo(() => (type === "region" ? MOCK_REGIONS : MOCK_CATEGORIES), [type]);

    // Parse the current value into levels
    useEffect(() => {
        if (value) {
            // Avoid duplication if the value is just the parent path
            if (value === parentPath) {
                setSelectedLevels([]);
            } else {
                setSelectedLevels(value.split(" > "));
            }
        } else {
            setSelectedLevels([]);
        }
    }, [value, parentPath]);

    // Filtering logic
    useEffect(() => {
        const activeParent = parentPath || "";
        
        if (query.length > 0) {
            const matches = mockData.filter(c => 
                c.toLowerCase().includes(query.toLowerCase()) && 
                (!activeParent || c.startsWith(activeParent + " > "))
            );
            setResults(matches.filter(m => m !== value));
        } else {
            if (!activeParent && (!value || value.split(" > ").length < 2)) {
                // Initial state: Show top level categories only (Level 0 + Level 1)
                const options = new Set();
                mockData.forEach(p => {
                    const parts = p.split(" > ");
                    if (parts.length >= 2) options.add(parts.slice(0, 2).join(" > "));
                });
                setResults(Array.from(options));
            } else {
                // Sub-category state: Show ALL full sub-paths under the active selection
                const searchRoot = activeParent || value;
                const options = mockData.filter(p => p.startsWith(searchRoot + " > ") && p !== searchRoot);
                setResults(options);
            }
        }
    }, [query, mockData, value, parentPath]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setShowResults(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayLevels = useMemo(() => {
        if (!selectedLevels.length) return [];
        if (!parentPath) return selectedLevels;
        
        const parental = parentPath.split(" > ");
        // Return only parts of selectedLevels that are not in parentPath
        return selectedLevels.filter(lvl => !parental.includes(lvl));
    }, [selectedLevels, parentPath]);

    const handleSelect = (res) => {
        onChange(res);
        setQuery("");
        setShowResults(false);
    };

    const clearLevel = (idx) => {
        if (idx === -1) {
            onChange("");
        } else {
            // Reconstruct the path properly based on relative index
            const actualLevels = [...(parentPath ? parentPath.split(" > ") : []), ...displayLevels];
            const parentCount = parentPath ? parentPath.split(" > ").length : 0;
            const newPath = actualLevels.slice(0, parentCount + idx + 1).join(" > ");
            onChange(newPath);
        }
    };

    return (
        <div className="space-y-3 w-full" ref={containerRef}>
            {/* Selected Hierarchy Breadcrumbs - Only show difference from parent */}
            {displayLevels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    {displayLevels.map((lvl, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <div className="flex items-center bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 group/chip transition-all hover:bg-blue-100 hover:border-blue-200">
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                                    {lvl.includes('(') ? lvl.split('(')[0].trim() : lvl}
                                </span>
                                <button 
                                    onClick={() => clearLevel(idx)}
                                    className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 text-blue-400 hover:text-blue-700 transition-colors"
                                >
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            {idx < displayLevels.length - 1 && <span className="text-slate-300 text-[10px] font-bold">/</span>}
                        </div>
                    ))}
                    <button 
                        onClick={() => clearLevel(-1)}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors ml-1"
                    >
                        Clear
                    </button>
                </div>
            )}

            <div className="relative group z-[50]">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        required={required && !value}
                        value={query}
                        onFocus={() => setShowResults(true)}
                        onChange={(e) => { setQuery(e.target.value); if (!e.target.value && !selectedLevels.length) onChange(""); }}
                        placeholder={selectedLevels.length > 0 ? `Add Sub-${type === 'category' ? 'Category' : 'Level'}...` : placeholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 pr-12"
                    />
                    <div className="absolute right-0 h-full w-12 flex items-center justify-center border-l border-slate-200 bg-slate-50 group-hover:bg-slate-100 cursor-pointer rounded-r-xl">
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                
                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-300 shadow-2xl z-[9999] max-h-[300px] overflow-y-auto mt-1 rounded-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                        {results.map((res, idx) => {
                            const isAlreadySelected = selectedLevels.join(" > ") === res;
                            if (isAlreadySelected) return null;

                            const parts = res.split(' > ');
                            const endTerm = parts[parts.length - 1];
                            const isSearchMatch = query.length > 0;

                            return (
                                <div 
                                    key={idx}
                                    onClick={() => handleSelect(res)}
                                    className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group flex flex-col gap-0.5"
                                >
                                    {isSearchMatch && parts.length > 1 && (
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                            {parts.slice(0, -1).join(' > ')}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] font-bold text-slate-700 group-hover:text-blue-700 uppercase tracking-tight">
                                            {endTerm}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                            {mockData.some(p => p.startsWith(res + " > ")) ? "Level " + parts.length : "Final"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

function TreeNodeRenderer({ node, number, values, files, setValues, setFiles, collapsed, setCollapsed, repeatIndex }) {
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
    <div className={`w-full transition-all ${isTopLevel ? "" : "mt-2 rounded-2xl border border-slate-200 bg-white"}`}>
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
            {node.title} {repeatIndex ? `#${repeatIndex}` : ""}
        </span>
      </div>

      {!isCollapsed ? (
        <div className={`transition-all ${isTopLevel ? "pt-2" : "border-t border-slate-100 p-5 bg-slate-50/30"}`}>
          {node.fields && node.fields.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
              {node.fields.map((field) => (
                <FieldRenderer 
                  key={field.id} 
                  field={field} 
                  values={values} 
                  files={files} 
                  setValues={setValues} 
                  setFiles={setFiles} 
                  repeatIndex={repeatIndex} 
                />
              ))}
            </div>
          )}
          
          {node.children && node.children.length > 0 && (
            <div className="flex flex-col gap-2">
              {node.children.map((child, idx) => {
                // SMART AUTO-DETECTION: If title contains "Bank" and we find a "how many" field inside or same level
                let isRepeatable = child.repeatable;
                let repeatKey = child.repeatSourceFieldId;

                if (!isRepeatable && child.title?.toLowerCase().includes("bank")) {
                    const countField = child.fields?.find(f => f.label?.toLowerCase().includes("how many") && f.label?.toLowerCase().includes("bank"));
                    if (countField) {
                        isRepeatable = true;
                        repeatKey = countField.id;
                    }
                }

                // REPETITION LOGIC
                if (isRepeatable && repeatKey) {
                  const textMap = { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5 };
                  const rawVal = String(values[repeatKey] || values[`${repeatKey}_1`] || "1").toLowerCase();
                  const count = textMap[rawVal] || parseInt(rawVal, 10) || 1;
                  
                  const repeatArray = Array.from({ length: Math.min(count, 10) }, (_, i) => i + 1); 
                  
                  return repeatArray.map((num) => (
                    <TreeNodeRenderer
                      key={`${child.id}_${num}`}
                      node={child}
                      number={`${number}.${idx + 1}.${num}`}
                      values={values}
                      files={files}
                      setValues={setValues}
                      setFiles={setFiles}
                      collapsed={collapsed}
                      setCollapsed={setCollapsed}
                      repeatIndex={num}
                    />
                  ));
                }

                return (
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
                    repeatIndex={repeatIndex}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FieldRenderer({ field, values, files, setValues, setFiles, repeatIndex }) {
  const fieldKey = repeatIndex ? `${field.id}_${repeatIndex}` : field.id;
  const setValue = (v) => setValues((p) => ({ ...p, [fieldKey]: v }));
  const current = values[fieldKey] ?? (field.type === "checkbox" ? [] : "");
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
          onChange={(e) => setFiles((p) => ({ ...p, [fieldKey]: e.target.files?.[0] || null }))}
        />
        {files[fieldKey]?.name ? <p className="text-xs text-slate-500">Selected: {files[fieldKey].name}</p> : null}
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

  if (field.label === "Category" || field.label === "Sub Category" || field.label === "Region") {
    const isSub = field.label === "Sub Category";
    const categoryVal = values["serviceCategory"] || "";
    
    return (
      <div className={`space-y-1 ${wideSpanClass} relative focus-within:z-50`}>
        <label className="text-xs font-semibold tracking-wide text-slate-700">
          {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
        </label>
        <CategoryAutocomplete
            required={field.required}
            placeholder={field.placeholder || `Select ${field.label}`}
            value={current}
            onChange={(val) => {
                setValue(val);
                // If main category changes, we should probably clear sub-category?
                // But let's keep it simple for now as the user requested "nothing should break"
            }}
            type={field.label === "Region" ? "region" : "category"}
            parentPath={isSub ? categoryVal : ""}
        />
        {hintText ? <p className="text-[11px] text-slate-500">{hintText}</p> : null}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${wideSpanClass} relative focus-within:z-50`}>
      <label className="text-xs font-semibold tracking-wide text-slate-700">
        {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
      </label>
      <input
        type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
        className={inputBaseClass}
        placeholder={field.placeholder || ""}
        value={current}
        onChange={handleInputChange}
      />
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
  const [activeStep, setActiveStep] = useState(0);
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
    const lab = (label || "").toLowerCase();
    const isPincode = isPostalLabel(lab);
    
    if (isPincode && /^\d{6}$/.test(normalizedValue)) {
      console.log("Pincode detected:", normalizedValue);
      try {
        const url = `https://api.postalpincode.in/pincode/${normalizedValue}`;
        const res = await axios.get(url);
        const data = res.data?.[0];
        
        if (data && data.Status === "Success" && data.PostOffice && data.PostOffice.length > 0) {
            const first = data.PostOffice[0];
            const districtValue = pickPostalValue(first.District, first.Division, first.Name);
            const cityValue = pickPostalValue(
              first.Block && first.Block !== districtValue ? first.Block : "",
              first.Name && first.Name !== districtValue ? first.Name : "",
              first.Division && first.Division !== districtValue ? first.Division : "",
              first.District
            );
            const stateValue = pickPostalValue(first.State);
            
            console.log("API Response:", { cityValue, stateValue, districtValue });

            const allNodes = flattenNodes(form?.structure || []);
            const allFields = allNodes.flatMap(n => n.fields || []);
            
            // Smarter finding by label
            const cityField = allFields.find(f => {
                const fl = (f.label || "").toLowerCase();
                return fl.includes("city") || fl.includes("town");
            });
            const districtField = allFields.find(f => (f.label || "").toLowerCase().includes("district"));
            const stateField = allFields.find(f => {
                const fl = (f.label || "").toLowerCase();
                return fl.includes("state") || fl.includes("region");
            });

            const update = {};
            if (cityField) {
                update[cityField.id] = cityValue;
            }
            if (districtField) {
                update[districtField.id] = districtValue;
            }
            if (stateField) {
                update[stateField.id] = formatPostalRegionValue(stateField.label, stateValue);
            }

            console.log("Final Update Object:", update);
            if (Object.keys(update).length > 0) {
                setValues(prev => ({ ...prev, ...update }));
            }
        }
      } catch (err) {
        console.error("Autofill API failed", err);
      }
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
            const pinField = allNodes
              .flatMap((n) => n.fields || [])
              .find((f) => isPostalLabel(f.label));
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
        
        if (pattern !== "gst" && pattern !== "ifsc" && !isPostalLabel(label) && !label.includes("city")) return;

        const current = String(values[field.id] || "").trim().toUpperCase();
        const previous = String(previousAutofillValuesRef.current[field.id] || "").trim().toUpperCase();

        if (!current || current === previous) return;

        let isValid = false;
        if (pattern === "gst") isValid = GST_REGEX.test(current);
        else if (pattern === "ifsc") isValid = IFSC_REGEX.test(current);
        else if (isPostalLabel(label)) isValid = PINCODE_REGEX.test(current);
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
        const pattern = field.validation?.pattern;
        const label = field.label?.toLowerCase() || "";
        if (pattern === "gst" || pattern === "ifsc" || isPostalLabel(label) || label.includes("city")) {
          snapshot[field.id] = values[field.id];
        }
      });
    });
    previousAutofillValuesRef.current = snapshot;
  }, [values, form]);

  const validateStep = (stepIdx) => {
    const section = topSections[stepIdx];
    if (!section) return true;

    const missing = [];
    const textMap = { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5 };

    const checkNode = (node, repeatIndex = null) => {
      // 1. Node level visibility
      if (node.title?.includes("1.1.2.2.") && values["fillAdditional"] !== "Yes") return;

      // 2. Check fields in this node
      (node.fields || []).forEach(f => {
        if (!f.required) return;

        // Field level visibility (Hardcoded)
        if (f.id === "panNum" && values["panStatus"] !== "Available") return;
        if (f.id === "pfNo" && values["pfStatus"] !== "Yes") return;
        if (f.id === "esiNo" && values["esiStatus"] !== "Yes") return;

        const fieldKey = repeatIndex ? `${f.id}_${repeatIndex}` : f.id;
        if (!values[fieldKey]) {
          missing.push(f.label);
        }
      });

      // 3. Recursive check for children
      (node.children || []).forEach(child => {
        let isRepeatable = child.repeatable;
        let repeatKey = child.repeatSourceFieldId;

        // Smart detection (mirrors TreeNodeRenderer)
        if (!isRepeatable && child.title?.toLowerCase().includes("bank")) {
          const countField = child.fields?.find(f => f.label?.toLowerCase().includes("how many") && f.label?.toLowerCase().includes("bank"));
          if (countField) {
            isRepeatable = true;
            repeatKey = countField.id;
          }
        }

        if (isRepeatable && repeatKey) {
          const rawVal = String(values[repeatKey] || values[`${repeatKey}_1`] || "1").toLowerCase();
          const count = textMap[rawVal] || parseInt(rawVal, 10) || 1;
          for (let i = 1; i <= Math.min(count, 10); i++) {
            checkNode(child, i);
          }
        } else {
          checkNode(child, repeatIndex);
        }
      });
    };

    checkNode(section);

    if (missing.length > 0) {
      const uniqueMissing = Array.from(new Set(missing));
      setError(`Please fill mandatory fields: ${uniqueMissing.join(", ")}`);
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(p => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setActiveStep(p => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validateStep(activeStep)) return;
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
        {/* Original Header */}
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

        {/* Progress Bar (Simple Version) */}
        <div className="bg-white border-b border-slate-200 px-4 py-1 sticky top-[68px] z-40 w-full">
           <div className="w-full flex items-center gap-2 py-2 overflow-x-auto no-scrollbar px-2">
                {topSections.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${idx <= activeStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === activeStep ? 'text-blue-600' : 'text-slate-400'}`}>
                            {s.title?.split(' ').slice(0, 2).join(' ')}
                        </span>
                        {idx < topSections.length - 1 && <div className="h-px w-4 bg-slate-200"></div>}
                    </div>
                ))}
           </div>
           <div className="h-1 bg-slate-100 mt-1 absolute bottom-0 left-0 right-0">
                <div 
                    className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                    style={{ width: `${((activeStep + 1) / topSections.length) * 100}%` }}
                />
           </div>
        </div>

        <main className="flex-1 w-full p-4 md:p-6 space-y-6 pb-40">
            <div className="mb-2 px-2">
                <h2 className="text-xl font-black text-[#1e1e1e]">Step {activeStep + 1} of {topSections.length}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{topSections[activeStep]?.title}</span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-8 min-h-[400px] w-full">
                {topSections[activeStep] && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                        <TreeNodeRenderer
                            key={topSections[activeStep].id}
                            node={topSections[activeStep]}
                            number={`${activeStep + 1}`}
                            values={values}
                            files={files}
                            setValues={setValues}
                            setFiles={setFiles}
                            collapsed={collapsed}
                            setCollapsed={setCollapsed}
                        />
                    </div>
                )}
            </div>
        </main>

        {/* Original Style Floating Footer */}
        <div className="w-full px-4 md:px-6 pb-8 sticky bottom-0 z-40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md w-full">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                >
                    Save Draft
                </button>
                {activeStep > 0 && (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="rounded-lg border border-slate-300 bg-white px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                    >
                        Back
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {activeStep < topSections.length - 1 ? (
                    <button
                        onClick={nextStep}
                        className="rounded-lg bg-slate-900 px-10 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
                    >
                        Save & Next
                    </button>
                ) : (
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="rounded-lg bg-blue-700 px-10 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-700/30 transition-all hover:bg-blue-800 disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit Registration"}
                    </button>
                )}
            </div>
          </div>
        </div>

        {(error || success) && (
            <div className="fixed bottom-24 right-8 z-50 max-w-sm">
                {error && <p className="mb-2 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700 shadow-xl text-xs">{error}</p>}
                {success && <p className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-700 shadow-xl text-xs">{success}</p>}
            </div>
        )}
      </div>
  );
}

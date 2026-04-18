import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EMPTY_LOOKUP_STATE = {
    loading: false,
    tone: "idle",
    message: "",
    source: null,
    provider: null,
};

export const normalizeGstNumber = (value = "") =>
    String(value || "")
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .slice(0, 15);

const pickValue = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        if (typeof value === "string" && !value.trim()) continue;
        return value;
    }

    return "";
};

export default function useGstAutofill(setFormData) {
    const lastFetchedGstRef = useRef("");
    const [gstLookup, setGstLookup] = useState(EMPTY_LOOKUP_STATE);

    const resetGstLookup = () => {
        lastFetchedGstRef.current = "";
        setGstLookup(EMPTY_LOOKUP_STATE);
    };

    const lookupGst = async (rawGstNumber, options = {}) => {
        const { silent = false, force = false } = options;
        const gstNumber = normalizeGstNumber(rawGstNumber);

        if (!gstNumber) {
            resetGstLookup();
            return null;
        }

        if (!GSTIN_REGEX.test(gstNumber)) {
            if (!silent) {
                const message = "Valid 15-character GSTIN dalo, phir fetch chalega.";
                setGstLookup({
                    loading: false,
                    tone: "error",
                    message,
                    source: null,
                    provider: null,
                });
                toast.error(message);
            }
            return null;
        }

        if (!force && lastFetchedGstRef.current === gstNumber) {
            return null;
        }

        setGstLookup({
            loading: true,
            tone: "loading",
            message: "GST details fetch ho rahi hain...",
            source: null,
            provider: null,
        });

        try {
            const response = await api.get(`/vendors/gst-profile/${gstNumber}`);
            const profile = response.data?.data || {};
            const filledFields = [];

            setFormData((prev) => {
                const resolvedCompanyName = pickValue(
                    profile?.autofill?.companyName,
                    profile?.legalName,
                    profile?.tradeName
                );
                const resolvedCity = pickValue(
                    profile?.autofill?.address?.city,
                    profile?.principalAddress?.city
                );
                const resolvedState = pickValue(
                    profile?.autofill?.address?.state,
                    profile?.principalAddress?.state,
                    profile?.state
                );
                const resolvedPincode = pickValue(
                    profile?.autofill?.address?.pincode,
                    profile?.principalAddress?.pincode
                );

                const nextAddress = { ...(prev.address || {}) };

                if (!prev.companyName && resolvedCompanyName) {
                    filledFields.push("company name");
                }

                if (!nextAddress.city && resolvedCity) {
                    nextAddress.city = resolvedCity;
                    filledFields.push("city");
                }

                if (!nextAddress.state && resolvedState) {
                    nextAddress.state = resolvedState;
                    filledFields.push("state");
                }

                if (!nextAddress.pincode && resolvedPincode) {
                    nextAddress.pincode = resolvedPincode;
                    filledFields.push("pincode");
                }

                return {
                    ...prev,
                    companyName: prev.companyName || resolvedCompanyName || "",
                    address: nextAddress,
                };
            });

            lastFetchedGstRef.current = gstNumber;

            const source = profile?.source || "derived";
            const valid = profile?.valid !== false;
            const tone = !valid ? "error" : source === "provider" ? "success" : "warning";
            const providerLabel =
                source === "provider"
                    ? `API${profile?.provider ? ` (${profile.provider})` : ""}`
                    : "GSTIN decode";

            let message = profile?.message || "GST lookup complete.";
            if (!valid) {
                message = profile?.message || "Provided GSTIN invalid dikha raha hai.";
            } else if (filledFields.length > 0) {
                message = `${providerLabel} se ${filledFields.join(", ")} auto-fill hua.`;
            } else if (source === "provider") {
                message = `${providerLabel} se details mil gayi, lekin existing values overwrite nahi ki gayi.`;
            } else {
                message = profile?.message || "GSTIN se basic state info derive hui.";
            }

            setGstLookup({
                loading: false,
                tone,
                message,
                source,
                provider: profile?.provider || null,
            });

            return profile;
        } catch (error) {
            lastFetchedGstRef.current = "";
            const message = error.response?.data?.message || "GST details fetch nahi ho payi.";

            setGstLookup({
                loading: false,
                tone: "error",
                message,
                source: null,
                provider: null,
            });

            if (!silent) {
                toast.error(message);
            }

            return null;
        }
    };

    const handleGstBlur = (gstNumber) => {
        const normalizedGstNumber = normalizeGstNumber(gstNumber);
        if (normalizedGstNumber.length === 15) {
            return lookupGst(normalizedGstNumber, { silent: true });
        }

        return null;
    };

    return {
        gstLookup,
        lookupGst,
        handleGstBlur,
        resetGstLookup,
    };
}

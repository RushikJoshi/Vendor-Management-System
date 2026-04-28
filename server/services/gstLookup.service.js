const axios = require("axios");
const configs = require("../config/env");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const GST_STATE_CODE_MAP = {
    "01": "Jammu and Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "26": "Dadra and Nagar Haveli and Daman and Diu",
    "27": "Maharashtra",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman and Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh",
    "38": "Ladakh",
    "97": "Other Territory",
};

const pickValue = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        if (typeof value === "string" && !value.trim()) continue;
        return value;
    }

    return null;
};

const normalizeGstin = (gstNumber = "") =>
    String(gstNumber || "")
        .trim()
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .slice(0, 15);

const buildFullAddress = (address = {}) =>
    [
        address.building,
        address.buildingName,
        address.floor,
        address.street,
        address.locality,
        address.city,
        address.district,
        address.state,
        address.pincode,
    ]
        .filter(Boolean)
        .join(", ");

const normalizeAddress = (address = {}, fallbackState = null) => {
    const normalized = {
        type: pickValue(address.type, null),
        building: pickValue(address.building, null),
        buildingName: pickValue(address.buildingName, null),
        floor: pickValue(address.floor, null),
        street: pickValue(address.street, null),
        locality: pickValue(address.locality, null),
        district: pickValue(address.district, null),
        city: pickValue(address.city, address.district, address.locality),
        state: pickValue(address.state, fallbackState),
        pincode: pickValue(address.zip, address.pincode),
    };

    return {
        ...normalized,
        fullAddress: buildFullAddress(normalized),
    };
};

const createDerivedProfile = (gstNumber) => {
    const normalized = normalizeGstin(gstNumber);

    if (!GSTIN_REGEX.test(normalized)) {
        throw new AppError("Invalid GST number format. Example: 22AAAAA0000A1Z5", 400);
    }

    const stateCode = normalized.slice(0, 2);
    const state = GST_STATE_CODE_MAP[stateCode] || null;

    return {
        gstNumber: normalized,
        source: "derived",
        provider: null,
        valid: true,
        active: null,
        message: "Basic GST details were derived from the GSTIN format.",
        legalName: null,
        tradeName: null,
        pan: normalized.slice(2, 12),
        constitution: null,
        taxpayerType: null,
        gstStatus: null,
        registrationDate: null,
        filingStatus: null,
        stateCode,
        state,
        principalAddress: normalizeAddress({}, state),
        autofill: {
            companyName: null,
            address: {
                city: null,
                state,
                pincode: null,
            },
        },
    };
};

const normalizeAttestrProfile = (payload, fallbackProfile) => {
    const addresses = Array.isArray(payload?.addresses) ? payload.addresses : [];
    const primaryAddress =
        addresses.find((address) => String(address?.type || "").toUpperCase() === "PRIMARY") ||
        addresses[0] ||
        {};

    const normalizedAddress = normalizeAddress(primaryAddress, fallbackProfile.state);
    const legalName = pickValue(payload?.legalName, payload?.tradeName);
    const tradeName = pickValue(payload?.tradeName, payload?.legalName);

    return {
        gstNumber: fallbackProfile.gstNumber,
        source: "provider",
        provider: "attestr",
        valid: typeof payload?.valid === "boolean" ? payload.valid : true,
        active: typeof payload?.active === "boolean" ? payload.active : null,
        message: pickValue(payload?.message, "GST profile fetched from configured provider."),
        legalName,
        tradeName,
        pan: pickValue(payload?.pan, fallbackProfile.pan),
        constitution: pickValue(payload?.constitution, null),
        taxpayerType: pickValue(payload?.type, null),
        gstStatus:
            typeof payload?.active === "boolean"
                ? payload.active
                    ? "Active"
                    : "Inactive"
                : null,
        registrationDate: pickValue(payload?.registered, null),
        filingStatus:
            Array.isArray(payload?.filings) && payload.filings.length
                ? pickValue(payload.filings[0]?.status, null)
                : null,
        stateCode: pickValue(payload?.stateCode, fallbackProfile.stateCode),
        state: pickValue(normalizedAddress.state, fallbackProfile.state),
        principalAddress: normalizedAddress,
        autofill: {
            companyName: legalName || tradeName || null,
            address: {
                city: normalizedAddress.city,
                state: pickValue(normalizedAddress.state, fallbackProfile.state),
                pincode: normalizedAddress.pincode,
            },
        },
    };
};

const fetchFromAttestr = async (gstNumber, fallbackProfile) => {
    if (!configs.GST_ATTESTR_AUTH_TOKEN) {
        return null;
    }

    const url = `${configs.GST_ATTESTR_BASE_URL}/api/${configs.GST_ATTESTR_VERSION}/public/corpx/gstin`;
    const response = await axios.post(
        url,
        {
            gstin: gstNumber,
            fetchFilings: false,
        },
        {
            timeout: configs.GST_LOOKUP_TIMEOUT_MS,
            headers: {
                Authorization: `Basic ${configs.GST_ATTESTR_AUTH_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );

    return normalizeAttestrProfile(response.data, fallbackProfile);
};

const fetchFromGstincheck = async (gstNumber, fallbackProfile) => {
    if (!configs.GST_GSTINCHECK_API_KEY) {
        return null;
    }

    const url = `http://sheet.gstincheck.co.in/check/${configs.GST_GSTINCHECK_API_KEY}/${gstNumber}`;
    const response = await axios.get(url, { timeout: configs.GST_LOOKUP_TIMEOUT_MS });
    
    const payload = response.data;
    
    if (payload?.flag === false) {
        throw new AppError(payload.message || "Invalid GST Number", 400);
    }
    
    const data = payload?.data || {};
    const addr = data.pradr?.addr || {};
    
    const normalizedAddress = normalizeAddress({
        building: addr.bno,
        street: addr.st,
        locality: addr.loc,
        city: addr.city,
        pincode: addr.pncd,
        state: addr.stcd || fallbackProfile.state
    }, fallbackProfile.state);
    
    const legalName = pickValue(data.lgnm, data.tradeNam);
    const tradeName = pickValue(data.tradeNam, data.lgnm);

    return {
        gstNumber: fallbackProfile.gstNumber,
        source: "provider",
        provider: "gstincheck",
        valid: true,
        active: String(data.sts).toLowerCase() === "active",
        message: "GST profile fetched from gstincheck.",
        legalName,
        tradeName,
        pan: fallbackProfile.pan,
        constitution: null,
        taxpayerType: null,
        gstStatus: data.sts || null,
        registrationDate: data.rgdt || null,
        filingStatus: null,
        stateCode: fallbackProfile.stateCode,
        state: pickValue(normalizedAddress.state, fallbackProfile.state),
        principalAddress: normalizedAddress,
        autofill: {
            companyName: legalName || tradeName || null,
            address: {
                city: normalizedAddress.city,
                state: pickValue(normalizedAddress.state, fallbackProfile.state),
                pincode: normalizedAddress.pincode,
            },
        },
    };
};

const lookupGstProfile = async (gstNumber) => {
    const fallbackProfile = createDerivedProfile(gstNumber);
    const provider = String(configs.GST_LOOKUP_PROVIDER || "derived").trim().toLowerCase();

    if (provider === "derived") {
        return fallbackProfile;
    }

    if (provider === "attestr") {
        try {
            const providerProfile = await fetchFromAttestr(fallbackProfile.gstNumber, fallbackProfile);
            if (providerProfile) {
                return providerProfile;
            }
        } catch (error) {
            logger.warn(
                `GST lookup provider failed for ${fallbackProfile.gstNumber}: ${error.response?.data?.message || error.message}`
            );

            return {
                ...fallbackProfile,
                message: "External GST lookup is unavailable right now, so only GSTIN-derived basics were applied.",
            };
        }
    }

    if (provider === "gstincheck") {
        try {
            const providerProfile = await fetchFromGstincheck(fallbackProfile.gstNumber, fallbackProfile);
            if (providerProfile) {
                return providerProfile;
            }
        } catch (error) {
            logger.warn(
                `GST lookup provider failed for ${fallbackProfile.gstNumber}: ${error.response?.data?.message || error.message}`
            );

            return {
                ...fallbackProfile,
                message: error.message || "External GST lookup is unavailable right now, so only GSTIN-derived basics were applied.",
            };
        }
    }

    return {
        ...fallbackProfile,
        message: `GST provider '${provider}' is not configured. Only GSTIN-derived basics were applied.`,
    };
};

module.exports = {
    GSTIN_REGEX,
    normalizeGstin,
    lookupGstProfile,
};

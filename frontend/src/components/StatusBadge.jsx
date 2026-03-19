export default function StatusBadge({ status }) {
    const getStyles = (s) => {
        switch (s?.toLowerCase()) {
            case "approved":
            case "active":
            case "verified":
            case "eligible":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "pending":
            case "submitted":
            case "in_review":
            case "partially_eligible":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "rejected":
            case "not_eligible":
            case "expired":
            case "blacklisted":
                return "bg-rose-100 text-rose-700 border-rose-200";
            case "locked":
            case "draft":
            case "suspended":
            case "terminated":
                return "bg-gray-100 text-gray-700 border-gray-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStyles(status)}`}>
            {status?.replace("_", " ")}
        </span>
    );
}

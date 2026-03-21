export default function StatusBadge({ status }) {
    const getStyles = (s) => {
        switch (s?.toLowerCase()) {
            case "approved":
            case "active":
            case "verified":
            case "eligible":
                return "badge-green";
            case "pending":
            case "submitted":
            case "in_review":
            case "in progress":
                return "badge-blue";
            case "partially_eligible":
            case "risk":
                return "badge-yellow";
            case "rejected":
            case "not_eligible":
            case "expired":
            case "blacklisted":
                return "badge-red";
            case "locked":
            case "draft":
            case "suspended":
            case "terminated":
            default:
                return "badge-slate";
        }
    };

    return (
        <span className={`vms-badge border ${getStyles(status)} transition-all duration-300`}>
            {status?.replace("_", " ")}
        </span>
    );
}


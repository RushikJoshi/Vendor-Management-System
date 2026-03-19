export default function Badge({ children, type = "default" }) {
  let bg = "bg-gray-200 text-gray-800";
  if (type === "success") bg = "bg-green-100 text-green-800";
  if (type === "pending") bg = "bg-yellow-100 text-yellow-800";
  if (type === "danger") bg = "bg-red-100 text-red-800";
  return <span className={`${bg} px-2 py-1 rounded-full text-xs`}>{children}</span>;
}
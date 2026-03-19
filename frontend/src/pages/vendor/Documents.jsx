import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/Button";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get("/vendors/documents").then((res) => setDocs(res.data));
  }, []);

  const handleUpload = async (e) => {
    const f = e.target.files[0];
    const data = new FormData();
    data.append("file", f);
    await api.post("/vendors/documents", data);
    setDocs((d) => [...d, { name: f.name, url: URL.createObjectURL(f) }]);
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Documents</h2>
      <ul className="mb-4">
        {docs.map((d, idx) => (
          <li key={idx} className="mb-1">
            <a href={d.url} target="_blank" className="text-blue-600 hover:underline">
              {d.name}
            </a>
          </li>
        ))}
      </ul>
      <input type="file" onChange={handleUpload} />
    </div>
  );
}
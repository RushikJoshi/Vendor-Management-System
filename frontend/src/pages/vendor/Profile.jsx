import { useEffect, useState } from "react";
import api from "../../services/api";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import { User, Building2, Mail, Phone, MapPin, Save, Briefcase } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/vendors/me")
      .then((res) => setInfo(res.data.data || {}))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    if (!info) return;
    setInfo({ ...info, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Updating profile...");
    try {
      await api.put("/vendors/me", info);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Safe fallback if info is null for some reason
  if (!info) {
      return (
          <div className="max-w-4xl mx-auto p-12 text-center">
              <p className="text-slate-400">Unable to load profile. Please try refreshing.</p>
          </div>
      );
  }


  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400">Manage your business information and public profile.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 text-center sticky top-28">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
              {info?.companyName?.charAt(0) || '?'}
            </div>
            <h3 className="text-xl font-bold text-white">{info?.companyName || 'No Company Profile'}</h3>
            <p className="text-slate-400 text-sm mb-6">{info?.serviceType || 'Registration Pending'}</p>
            <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              {info?.status || 'Draft'}
            </div>

          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Company Name"
                  name="companyName"
                  value={info?.companyName || ""}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Service Type"
                  name="serviceType"
                  value={info?.serviceType || ""}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Contact Person"
                  name="contactPerson"
                  value={info?.contactPerson || ""}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Business Email"
                  type="email"
                  name="email"
                  value={info?.email || ""}
                  disabled
                  className="bg-slate-800/50 opacity-70 cursor-not-allowed"
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  value={info?.phone || ""}
                  onChange={handleChange}
                  required
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Business Address"
                    name="address"
                    value={info?.address || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>


              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
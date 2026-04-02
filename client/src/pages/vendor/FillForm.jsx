import { useState } from "react";
import { ClipboardCheck, FileText, Send, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  Field,
  InfoPanel,
  PageHero,
  PageShell,
  SectionCard,
  SummaryTile,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "../../components/vendor/VendorUI";

export default function FillForm() {
  const [form, setForm] = useState({
    companyName: "",
    identifier: "",
    summary: "",
  });

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("UI updated. Submission flow can be connected without backend changes.");
  };

  return (
    <PageShell>
      <PageHero
        badge="Vendor onboarding form"
        title="Prepare your vendor onboarding details."
        description="This form now follows the admin dashboard typography, cards, and spacing so vendor onboarding feels consistent with the rest of the portal."
        stats={[
          { icon: ClipboardCheck, label: "Form state", value: "Draft" },
          { icon: ShieldCheck, label: "Review mode", value: "Vendor ready" },
          { icon: FileText, label: "Sections", value: 3 },
        ]}
        aside={
          <>
            <InfoPanel
              icon={ShieldCheck}
              title="Form guidance"
              value="Keep responses clear"
              note="Use accurate company details so admin review and onboarding can move smoothly."
              toneClass="bg-emerald-50 text-emerald-600"
            />
            <InfoPanel
              icon={ClipboardCheck}
              title="Current state"
              value="UI only updated"
              note="This refactor changes only presentation. Backend endpoints and submission logic remain untouched."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Vendor Submission Form" description="Enter the core details that support onboarding review.">
          <form onSubmit={handleSubmit} className="space-y-5 p-4 xl:p-5">
            <Field label="Company name">
              <input
                type="text"
                value={form.companyName}
                onChange={handleChange("companyName")}
                className={inputClass}
                placeholder="Enter company name"
              />
            </Field>

            <Field label="Tax / registration identifier">
              <input
                type="text"
                value={form.identifier}
                onChange={handleChange("identifier")}
                className={inputClass}
                placeholder="Enter GST, PAN, or company identifier"
              />
            </Field>

            <Field label="Business summary" hint="Keep this concise and focused on your services, capabilities, and market coverage.">
              <textarea
                rows="6"
                value={form.summary}
                onChange={handleChange("summary")}
                className={textareaClass}
                placeholder="Describe your services, capabilities, and business focus"
              />
            </Field>

            <div className="border-t border-slate-100 pt-5">
              <button type="submit" className={primaryButtonClass}>
                <Send size={16} />
                Save draft
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Submission Notes" description="Helpful context while filling out this page.">
          <div className="space-y-3 p-4">
            <SummaryTile
              label="Admin view"
              value="Clean dashboard styling"
              note="Typography and spacing now match the admin dashboard family you referenced."
            />
            <SummaryTile
              label="Backend status"
              value="No backend change"
              note="Only UI styling and layout were adjusted for this vendor page."
            />
            <SummaryTile
              label="Recommended next step"
              value="Complete key fields first"
              note="Company name, identifiers, and business summary usually help reviewers faster."
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

import { BookOpen, FileSignature, FolderOpen, ShieldCheck } from "lucide-react";

import {
  EmptyState,
  InfoPanel,
  LinkButton,
  PageHero,
  PageShell,
  SectionCard,
  SummaryTile,
} from "../../components/vendor/VendorUI";

export default function Contracts() {
  return (
    <PageShell>
      <PageHero
        badge="Vendor contracts"
        title="Review contracts and agreement records."
        description="This page follows the admin dashboard style so contracts, supporting material, and agreement status can live in the same visual system as the rest of the vendor workspace."
        stats={[
          { icon: FileSignature, label: "Contracts", value: 0 },
          { icon: ShieldCheck, label: "Review status", value: "Waiting" },
          { icon: FolderOpen, label: "Reference files", value: "Available" },
        ]}
        aside={
          <>
            <InfoPanel
              icon={ShieldCheck}
              title="Agreement status"
              value="No active vendor contracts"
              note="Executed agreements will appear here when available in the vendor workspace."
              toneClass="bg-amber-50 text-amber-600"
            />
            <InfoPanel
              icon={BookOpen}
              title="Vendor guidance"
              value="Keep documents current"
              note="Your profile and document library help support faster contract processing."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
        primaryAction={<LinkButton to="/vendor/documents">Open documents</LinkButton>}
        secondaryAction={<LinkButton to="/vendor/profile" variant="secondary">Update profile</LinkButton>}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Agreement Workspace" description="Contracts and signed files will appear here when available.">
          <EmptyState
            icon={FileSignature}
            title="No contracts available"
            description="Once agreements are shared with your vendor account, they will appear in this workspace with download and review actions."
          />
        </SectionCard>

        <SectionCard title="Helpful Notes" description="Context to keep your contract workflow ready.">
          <div className="space-y-3 p-4">
            <SummaryTile
              label="Profile readiness"
              value="Keep contact details updated"
              note="Admin teams usually rely on your latest company and contact details while processing agreements."
            />
            <SummaryTile
              label="Document readiness"
              value="Compliance files should be current"
              note="Document accuracy can reduce delays during legal and procurement review."
            />
            <SummaryTile
              label="Next step"
              value="Monitor this page regularly"
              note="Signed contracts and related files will appear here without any backend changes to this update."
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

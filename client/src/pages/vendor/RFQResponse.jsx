import { FileText, SearchCheck, ShieldCheck, Zap } from "lucide-react";

import {
  EmptyState,
  InfoPanel,
  LinkButton,
  PageHero,
  PageShell,
  SectionCard,
  SummaryTile,
} from "../../components/vendor/VendorUI";

export default function RFQResponse() {
  return (
    <PageShell>
      <PageHero
        badge="Vendor RFQs"
        title="Respond to RFQ opportunities."
        description="This vendor RFQ page now follows the admin dashboard font, color, and spacing system so sourcing activity feels consistent across the full portal."
        stats={[
          { icon: FileText, label: "Open RFQs", value: 0 },
          { icon: Zap, label: "Responses", value: 0 },
          { icon: ShieldCheck, label: "Readiness", value: "Review profile" },
        ]}
        aside={
          <>
            <InfoPanel
              icon={SearchCheck}
              title="Marketplace status"
              value="No open RFQs"
              note="As sourcing requests become available, they will be listed here for response and tracking."
              toneClass="bg-amber-50 text-amber-600"
            />
            <InfoPanel
              icon={ShieldCheck}
              title="Visibility tip"
              value="Keep documents complete"
              note="Profile and document quality often affect how quickly sourcing teams can evaluate responses."
              toneClass="bg-indigo-50 text-indigo-600"
            />
          </>
        }
        primaryAction={<LinkButton to="/vendor/documents">Review documents</LinkButton>}
        secondaryAction={<LinkButton to="/vendor/profile" variant="secondary">Open profile</LinkButton>}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Open RFQ Feed" description="Available sourcing requests will appear here.">
          <EmptyState
            icon={FileText}
            title="No active RFQs right now"
            description="When procurement teams publish RFQs for your vendor account, they will show up here with response deadlines and details."
          />
        </SectionCard>

        <SectionCard title="RFQ Readiness" description="A few reminders to help prepare for future RFQs.">
          <div className="space-y-3 p-4">
            <SummaryTile
              label="Company profile"
              value="Keep details accurate"
              note="Business information should match what sourcing teams expect during evaluation."
            />
            <SummaryTile
              label="Documents"
              value="Maintain current files"
              note="Certificates and supporting files help speed up procurement review."
            />
            <SummaryTile
              label="Response flow"
              value="Watch this page"
              note="As soon as RFQs are available, the vendor workspace will surface them here."
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

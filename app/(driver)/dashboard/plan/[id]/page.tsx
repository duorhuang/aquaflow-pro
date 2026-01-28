import { PlanEditor } from "@/components/dashboard/PlanEditor";
import { MOCK_PLAN } from "@/lib/data";

// In a real app, this would be an async server component fetching from DB
// For now, we mock it.
export default function EditPlanPage({ params }: { params: { id: string } }) {
    // Simple mock lookup
    const plan = params.id === "p1" ? MOCK_PLAN : undefined;

    // If plan not found, PlanEditor will start blank or specific error behavior
    // For demo, we just pass MOCK_PLAN if matches, else nothing (new plan feel)

    return <PlanEditor initialPlan={plan} />;
}

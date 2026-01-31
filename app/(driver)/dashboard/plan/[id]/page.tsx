import { PlanEditor } from "@/components/dashboard/PlanEditor";
import { MOCK_PLANS } from "@/lib/data";

// In a real app, this would be an async server component fetching from DB
// For now, we mock it.
export default function EditPlanPage({ params }: { params: { id: string } }) {
    // Simple mock lookup
    const plan = MOCK_PLANS[0];

    // If plan not found, PlanEditor will start blank or specific error behavior
    // For demo, we just pass MOCK_PLAN if matches, else nothing (new plan feel)

    return <PlanEditor initialPlan={plan} />;
}

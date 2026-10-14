import { redirect } from "next/navigation";

export default function QuickPlanRedirect() {
    redirect("/dashboard/weekly-plan");
}

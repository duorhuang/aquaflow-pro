import { redirect } from "next/navigation";

export default function PoolsideRedirect() {
    redirect("/login");
}

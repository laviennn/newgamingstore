import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { getPromoCodes } from "./actions";
import { PromosClient } from "./PromosClient";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  if (!(await checkPermission("manage_promos"))) {
    redirect("/?error=unauthorized");
  }

  const promos = await getPromoCodes();
  
  return <PromosClient initialPromos={promos} />;
}

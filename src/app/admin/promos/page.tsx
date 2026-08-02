import { getPromoCodes } from "./actions";
import { PromosClient } from "./PromosClient";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  const promos = await getPromoCodes();
  
  return <PromosClient initialPromos={promos} />;
}

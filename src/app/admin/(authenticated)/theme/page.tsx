import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import ThemeClient from "./ThemeClient";

export default async function ThemePage() {
  if (!(await checkPermission("manage_theme"))) {
    redirect("/?error=unauthorized");
  }
  return <ThemeClient />;
}

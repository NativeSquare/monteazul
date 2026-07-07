import { redirect } from "next/navigation";

// The "Team" admin-management flow (invite/manage other admins) is disabled for
// the MVP — new admins are seeded manually in the DB. The route is kept as a
// redirect so any old link lands somewhere sensible. To bring it back, restore
// the previous version from git history and re-add the sidebar entry.
export default function TeamPage() {
  redirect("/negocios");
}

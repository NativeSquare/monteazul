"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

// Minimal top bar: just the control that collapses/expands the sidebar. The old
// breadcrumb was noise (the sidebar already shows where you are), so it's gone.
export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
      </div>
    </header>
  )
}

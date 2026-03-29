"use client"

import { Settings, FileText, Download, ShieldCheck, ChevronDown, Database, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="hidden md:flex h-9 font-semibold">
        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
        Export Report
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-9 font-semibold shadow-sm">
            <Sliders className="mr-2 h-4 w-4" />
            Actions
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
            Management
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer py-2">
            <ShieldCheck className="mr-3 h-4 w-4 text-muted-foreground" />
            <span>Review Requests</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2">
            <Database className="mr-3 h-4 w-4 text-muted-foreground" />
            <span>Database Backup</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
            System
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer py-2">
            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
            <span>General Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

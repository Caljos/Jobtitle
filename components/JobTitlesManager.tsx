"use client"

import * as React from "react"
import { Pencil, Trash2, Plus, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Import generated NOC data
import nocData from "./noc-data.json"

interface JobTitle {
  id: string
  standardOccupation: string
  internalTitle: string
}

export function JobTitlesManager() {
  const [jobs, setJobs] = React.useState<JobTitle[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingJob, setEditingJob] = React.useState<JobTitle | null>(null)
  
  // Form State
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [standardOccupation, setStandardOccupation] = React.useState("")
  const [internalTitle, setInternalTitle] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  // Filtered list for performance (max 50 items visible at once)
  // We initialize with a slice to avoid empty state flash
  const [filteredOccupations, setFilteredOccupations] = React.useState<string[]>(nocData.slice(0, 50))
  
  // Need to track search query manually because standard Command filtering 
  // on 10k items in React might be sluggish if we rendered them all.
  // Instead, we'll filter the source array and only render the results.
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredOccupations(nocData.slice(0, 50))
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const matches = []
    // Efficiently find first 50 matches
    for (let i = 0; i < nocData.length; i++) {
      if (nocData[i].toLowerCase().includes(lowerQuery)) {
        matches.push(nocData[i])
        if (matches.length >= 50) break
      }
    }
    setFilteredOccupations(matches)
  }, [searchQuery])

  const resetForm = () => {
    setStandardOccupation("")
    setInternalTitle("")
    setError(null)
    setEditingJob(null)
    setSearchQuery("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEdit = (job: JobTitle) => {
    setEditingJob(job)
    setStandardOccupation(job.standardOccupation)
    setInternalTitle(job.internalTitle)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job title?")) {
      setJobs(jobs.filter(job => job.id !== id))
    }
  }

  const handleSave = () => {
    setError(null)

    if (!standardOccupation) {
      setError("Standard Occupation is required.")
      return
    }

    // Check for duplicates
    // Standard Occupation + Internal Title must be unique
    const isDuplicate = jobs.some(job => 
      job.id !== editingJob?.id && // Ignore self if editing
      job.standardOccupation === standardOccupation &&
      (job.internalTitle || "").trim() === internalTitle.trim()
    )

    if (isDuplicate) {
      setError("This combination of Standard Occupation and Internal Title already exists.")
      return
    }

    if (editingJob) {
      // Update
      setJobs(jobs.map(job => 
        job.id === editingJob.id 
          ? { ...job, standardOccupation, internalTitle: internalTitle.trim() }
          : job
      ))
    } else {
      // Add
      setJobs([
        ...jobs,
        {
          id: Math.random().toString(36).substring(2, 9),
          standardOccupation,
          internalTitle: internalTitle.trim()
        }
      ])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Job Titles</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Job Title
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Job Title (Displayed)</TableHead>
              <TableHead className="w-[40%]">Standard Occupation</TableHead>
              <TableHead className="w-[20%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No job titles found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    {job.internalTitle ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">{job.internalTitle}</span>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          Internal Alias
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">{job.standardOccupation}</span>
                    )}
                  </TableCell>
                  <TableCell>{job.standardOccupation}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(job)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Title" : "Add Job Title"}</DialogTitle>
            <DialogDescription>
              Standardize job titles using NOC codes. Internal titles are optional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="standard-occupation" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Standard Occupation
              </Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="justify-between w-full font-normal"
                  >
                    {standardOccupation
                      ? standardOccupation
                      : "Select occupation..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Search occupation..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No occupation found.</CommandEmpty>
                      <CommandGroup>
                        {filteredOccupations.map((occupation) => (
                          <CommandItem
                            key={occupation}
                            value={occupation}
                            onSelect={(currentValue) => {
                              // Shadcn/cmdk might lowercase the value, so we use our source of truth
                              // But since we are rendering exact strings from filteredOccupations, 
                              // currentValue matches the occupation text (mostly) but normalized
                              const original = filteredOccupations.find(o => o.toLowerCase() === currentValue.toLowerCase())
                              const newValue = original || currentValue
                              setStandardOccupation(newValue === standardOccupation ? "" : newValue)
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                standardOccupation === occupation ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {occupation}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internal-title">Internal Title</Label>
              <Input
                id="internal-title"
                value={internalTitle}
                onChange={(e) => setInternalTitle(e.target.value)}
                placeholder="e.g. Senior Wizard"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Optional. Shown in your org chart and UI.
              </p>
            </div>
            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

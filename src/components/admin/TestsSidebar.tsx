import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { ChevronDown, ChevronRight, FileText, Folder, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";

interface AdminTestSummary { _id: Id<"tests">; name: string; description?: string; questionCount: number; status: "draft" | "published"; updatedAt: number; folderId?: Id<"folders">; }
export interface QuizFolder { _id: Id<"folders">; name: string; parentId?: Id<"folders">; }
interface Props {
  tests: AdminTestSummary[]; folders: QuizFolder[]; selectedTestId: Id<"tests"> | null; selectedFolderId: Id<"folders"> | null; searchValue: string;
  onSearchChange: (value: string) => void; onSelectTest: (id: Id<"tests">) => void; onSelectFolder: (id: Id<"folders"> | null) => void;
  onCreateFolder: (parentId: Id<"folders"> | null) => void; onRenameFolder: (folder: QuizFolder) => void; onDeleteFolder: (folder: QuizFolder) => void;
  onMoveTest: (testId: Id<"tests">, folderId: Id<"folders"> | null) => void; onCreateDraft: () => void; onOpenImport: () => void;
}

function FolderRow({ folder, folders, depth, selectedId, expanded, onToggle, onSelect, onCreate, onRename, onDelete }: {
  folder: QuizFolder; folders: QuizFolder[]; depth: number; selectedId: Id<"folders"> | null; expanded: Set<string>;
  onToggle: (id: string) => void; onSelect: (id: Id<"folders">) => void; onCreate: (id: Id<"folders">) => void;
  onRename: (folder: QuizFolder) => void; onDelete: (folder: QuizFolder) => void;
}) {
  const children = folders.filter((item) => item.parentId === folder._id);
  const isOpen = expanded.has(folder._id);
  return <>
    <div className={`group flex items-center gap-1 rounded-lg pr-1 ${selectedId === folder._id ? "bg-[var(--color-primary-subtle)]" : "hover:bg-[var(--color-bg)]"}`} style={{ paddingLeft: `${depth * 14 + 4}px` }}>
      <button type="button" className="p-1" onClick={() => onToggle(folder._id)} aria-label={isOpen ? "Collapse folder" : "Expand folder"}>
        {children.length ? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="block h-4 w-4" />}
      </button>
      <button type="button" onClick={() => onSelect(folder._id)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm"><Folder className="h-4 w-4 shrink-0" /><span className="truncate">{folder.name}</span></button>
      <div className="hidden items-center group-hover:flex">
        <button type="button" className="p-1" title="New subfolder" onClick={() => onCreate(folder._id)}><FolderPlus className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1" title="Rename" onClick={() => onRename(folder)}><Pencil className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1 text-[var(--color-error)]" title="Delete" onClick={() => onDelete(folder)}><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    {isOpen && children.map((child) => <FolderRow key={child._id} folder={child} folders={folders} depth={depth + 1} selectedId={selectedId} expanded={expanded} onToggle={onToggle} onSelect={onSelect} onCreate={onCreate} onRename={onRename} onDelete={onDelete} />)}
  </>;
}

export function TestsSidebar(props: Props) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const roots = props.folders.filter((folder) => !folder.parentId);
  const toggle = (id: string) => setExpanded((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  return <aside className="card flex h-full flex-col overflow-hidden">
    <div className="space-y-3 border-b border-[var(--color-border)] p-5">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Quiz library</h2><span className="badge badge-rose">{props.tests.length}</span></div>
      <input value={props.searchValue} onChange={(e) => props.onSearchChange(e.target.value)} placeholder="Search quizzes..." className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2" />
      <div className="grid grid-cols-2 gap-2"><button onClick={props.onCreateDraft} className="btn btn-primary justify-center"><Plus className="h-4 w-4" /> New quiz</button><button onClick={props.onOpenImport} className="btn btn-secondary justify-center"><FileText className="h-4 w-4" /> Import</button></div>
    </div>
    <div className="border-b border-[var(--color-border)] p-3">
      <div className="mb-2 flex items-center justify-between px-2"><span className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Folders</span><button type="button" title="New root folder" onClick={() => props.onCreateFolder(null)} className="p-1"><FolderPlus className="h-4 w-4" /></button></div>
      <button type="button" onClick={() => props.onSelectFolder(null)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm ${props.selectedFolderId === null ? "bg-[var(--color-primary-subtle)]" : "hover:bg-[var(--color-bg)]"}`}><Folder className="h-4 w-4" /> Unfiled quizzes</button>
      {roots.map((folder) => <FolderRow key={folder._id} folder={folder} folders={props.folders} depth={0} selectedId={props.selectedFolderId} expanded={expanded} onToggle={toggle} onSelect={props.onSelectFolder} onCreate={props.onCreateFolder} onRename={props.onRenameFolder} onDelete={props.onDeleteFolder} />)}
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {props.tests.length === 0 && <p className="p-5 text-center text-sm text-[var(--color-text-secondary)]">No quizzes in this folder.</p>}
      {props.tests.map((test) => <div key={test._id} className={`rounded-2xl border p-3 ${props.selectedTestId === test._id ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]" : "border-[var(--color-border)]"}`}>
        <button type="button" className="w-full text-left" onClick={() => props.onSelectTest(test._id)}><div className="flex justify-between gap-2"><span className="truncate font-semibold">{test.name}</span><span className="text-xs">{test.status}</span></div><div className="mt-1 text-xs text-[var(--color-text-muted)]">{test.questionCount} questions</div></button>
        <select aria-label={`Move ${test.name} to folder`} value={test.folderId ?? ""} onChange={(e) => props.onMoveTest(test._id, (e.target.value || null) as Id<"folders"> | null)} className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs">
          <option value="">Unfiled quizzes</option>{props.folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.name}</option>)}
        </select>
      </div>)}
    </div>
  </aside>;
}

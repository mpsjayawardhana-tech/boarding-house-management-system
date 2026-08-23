import os

def insert_import(file_path, new_import):
    with open(file_path, 'r') as f:
        content = f.read()
    if 'import { PageHeader }' not in content:
        # insert after the first import or at top
        if 'import' in content:
            content = content.replace('import', new_import + '\nimport', 1)
        else:
            content = new_import + '\n' + content
        with open(file_path, 'w') as f:
            f.write(content)

# 1. Academics
path = '/Users/manusha/Documents/MS of PCG /app/academics/page.tsx'
if os.path.exists(path):
    insert_import(path, 'import { PageHeader } from "@/components/PageHeader";')
    with open(path, 'r') as f:
        content = f.read()
    
    old_header = """          <div className="flex justify-between items-center z-10 relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
              Academics
            </h1>
            <button className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
              GPA Calculator
            </button>
          </div>"""
    
    new_header = """          <PageHeader
            title="Academics"
            icon={GraduationCap}
            description="Manage your academic schedule, grades, and upcoming deadlines."
            actionButton={
              <button className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                GPA Calculator
              </button>
            }
          />"""
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)

# 2. Finance
path = '/Users/manusha/Documents/MS of PCG /app/finance/page.tsx'
if os.path.exists(path):
    insert_import(path, 'import { PageHeader } from "@/components/PageHeader";\nimport { Wallet } from "lucide-react";')
    with open(path, 'r') as f:
        content = f.read()
    
    old_header = """          <div className="flex justify-between items-center z-10 relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Finance Manager</h1>
            {currentUser?.role === 'admin' && (
              <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors">
                + Add Transaction
              </button>
            )}
          </div>"""
    
    new_header = """          <PageHeader
            title="Finance Manager"
            icon={Wallet}
            description="Track and manage boarding house transactions."
            actionButton={
              currentUser?.role === 'admin' && (
                <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors">
                  + Add Transaction
                </button>
              )
            }
          />"""
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)

# 3. Notices
path = '/Users/manusha/Documents/MS of PCG /app/notices/page.tsx'
if os.path.exists(path):
    insert_import(path, 'import { PageHeader } from "@/components/PageHeader";')
    with open(path, 'r') as f:
        content = f.read()
    
    old_header = """          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Pin className="w-10 h-10 text-[#00ff9d]" /> Notice Board
            </h1>
            {currentUser && (
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-emerald-500 text-black px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> <span className="hidden md:inline">Create Notice</span>
              </button>
            )}
          </div>"""
    
    new_header = """          <PageHeader
            title="Notice Board"
            icon={Pin}
            description="Important announcements and personal notes."
            actionButton={
              currentUser && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-emerald-500 text-black px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden md:inline">Create Notice</span>
                </button>
              )
            }
          />"""
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)

# 4. Roster
path = '/Users/manusha/Documents/MS of PCG /app/roster/page.tsx'
if os.path.exists(path):
    insert_import(path, 'import { PageHeader } from "@/components/PageHeader";\nimport { CalendarDays } from "lucide-react";')
    with open(path, 'r') as f:
        content = f.read()
    
    old_header = """          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Weekly Roster</h1>
            {currentUser?.role === 'admin' && (
              <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            )}
          </div>"""
    
    new_header = """          <PageHeader
            title="Weekly Roster"
            icon={CalendarDays}
            description="Manage and track daily chores."
            actionButton={
              currentUser?.role === 'admin' && (
                <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )
            }
          />"""
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)

# 5. Inventory
path = '/Users/manusha/Documents/MS of PCG /app/inventory/page.tsx'
if os.path.exists(path):
    insert_import(path, 'import { PageHeader } from "@/components/PageHeader";\nimport { Package } from "lucide-react";')
    with open(path, 'r') as f:
        content = f.read()
    
    old_header = """          <div className="flex justify-between items-center z-10 relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Advanced Inventory</h1>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => setIsAddingItem(true)}
                className="bg-[#00ff9d] text-black px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:bg-[#00e68d] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
          </div>"""
    
    new_header = """          <PageHeader
            title="Advanced Inventory"
            icon={Package}
            description="Manage and track house inventory items."
            actionButton={
              currentUser?.role === 'admin' && (
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="bg-[#00ff9d] text-black px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:bg-[#00e68d] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              )
            }
          />"""
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)

print("Headers refactored")

import os
import re

components = [
    'BudgetTracker.tsx', 'DebtManager.tsx', 'FinancialGoals.tsx', 
    'QuickExpenseModal.tsx', 'QuickDebtModal.tsx'
]

# Replacement for form inputs to glass styling
input_old_regex = r'className="w-full p-3 rounded-xl border border-\[#2a2d36\] bg-black/20 text-white shadow-sm font-medium focus:border-emerald-500/50 focus:outline-none transition-colors([^"]*)"'
input_new_replacement = r'className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-500\1"'

# Replacement for secondary buttons or list items
list_item_regex = r'hover:bg-white/5 transition-colors border border-transparent hover:border-\[#2a2d36\]'
list_item_replacement = r'hover:bg-white/10 transition-colors rounded-lg border border-transparent'

for comp in components:
    filepath = f"/Users/manusha/Documents/MS of PCG /components/{comp}"
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = re.sub(input_old_regex, input_new_replacement, content)
    content = re.sub(list_item_regex, list_item_replacement, content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Inputs refactored")

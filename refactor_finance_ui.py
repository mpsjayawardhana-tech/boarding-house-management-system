import os
import re

TARGET_CLASS = "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg shadow-black/20"

def replace_main_wrapper(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # We look for the first major return statement's wrapper
    # usually it starts with `<div className="bg-[#...` or `bg-gray-`
    # We will use regex to find the first `<div className="...` after `return (`
    
    # We can do this manually using a python logic
    parts = content.split('return (')
    if len(parts) > 1:
        after_return = parts[1]
        div_idx = after_return.find('<div className="')
        if div_idx != -1:
            start_quote = div_idx + len('<div className="')
            end_quote = after_return.find('"', start_quote)
            old_class = after_return[start_quote:end_quote]
            
            # if it's already using some flex classes, we might want to preserve them, but user said "Change their main container className to: ..."
            # wait, if I replace it completely, I lose flex-col, h-full, relative, etc.
            # let's just replace the background colors.
            # bg-gray-\d+, bg-[#...], bg-black, bg-white, border-gray-\d+, border-[#...], shadow-xl, shadow-2xl, rounded-2xl, rounded-[32px]
            
            new_class = re.sub(r'bg-(?:gray-\d+|\[#[^\]]+\](?:/\d+)?|black(?:/\d+)?|white(?:/\d+)?)', 'bg-white/5', old_class)
            new_class = re.sub(r'border-(?:gray-\d+|white/\[[\d.]+\]|\[#[^\]]+\])', 'border-white/10', new_class)
            new_class = re.sub(r'rounded-(?:2xl|3xl|\[\d+px\])', 'rounded-xl', new_class)
            new_class = re.sub(r'shadow-(?:xl|2xl|sm|md)', 'shadow-lg shadow-black/20', new_class)
            if 'backdrop-blur-md' not in new_class and 'backdrop-blur-xl' not in new_class:
                new_class += ' backdrop-blur-md'
            new_class = new_class.replace('backdrop-blur-xl', 'backdrop-blur-md')
            
            # replace in content
            parts[1] = after_return[:start_quote] + new_class + after_return[end_quote:]
            content = 'return ('.join(parts)
            
            with open(filepath, 'w') as f:
                f.write(content)

components = [
    'MyWalletCard.tsx', 'DailyExpenseWidget.tsx', 'BudgetTracker.tsx', 
    'DebtManager.tsx', 'FinancialGoals.tsx', 'ExpenseCategoryChart.tsx', 
    'MonthlyFinanceTrend.tsx'
]

for comp in components:
    replace_main_wrapper(f"/Users/manusha/Documents/MS of PCG /components/{comp}")

# Now fix Recharts styling in ExpenseCategoryChart.tsx
chart_path = '/Users/manusha/Documents/MS of PCG /components/ExpenseCategoryChart.tsx'
if os.path.exists(chart_path):
    with open(chart_path, 'r') as f:
        content = f.read()
    content = re.sub(
        r'contentStyle=\{\{ backgroundColor: \'#[A-Fa-f0-9]+\', borderColor: \'#[A-Fa-f0-9]+\', borderRadius: \'[^\']+\', color: \'#fff\' \}\}',
        "contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}",
        content
    )
    with open(chart_path, 'w') as f:
        f.write(content)

# MonthlyFinanceTrend.tsx
chart_path = '/Users/manusha/Documents/MS of PCG /components/MonthlyFinanceTrend.tsx'
if os.path.exists(chart_path):
    with open(chart_path, 'r') as f:
        content = f.read()
    content = re.sub(
        r'contentStyle=\{\{[^}]+\}\}',
        "contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}",
        content
    )
    content = re.sub(
        r'<CartesianGrid stroke="[^"]+" />',
        '<CartesianGrid stroke="rgba(255,255,255,0.05)" />',
        content
    )
    with open(chart_path, 'w') as f:
        f.write(content)

print("Done")

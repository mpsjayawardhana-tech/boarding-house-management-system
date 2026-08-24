import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  actionButton?: ReactNode;
}

export function PageHeader({ title, icon: Icon, description, actionButton }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-6 md:px-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-emerald-400" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-sm text-gray-400 mt-2 font-medium ml-1">
            {description}
          </p>
        )}
      </div>
      
      {actionButton && (
        <div className="flex items-center shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
}

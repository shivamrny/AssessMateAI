import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
}

const DashboardCard = ({ title, value, icon, subtitle }: DashboardCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

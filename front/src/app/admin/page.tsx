export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to your administration panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month' },
          { label: 'Subscriptions', value: '+2350', change: '+180.1% from last month' },
          { label: 'Sales', value: '+12,234', change: '+19% from last month' },
          { label: 'Active Now', value: '+573', change: '+201 since last hour' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Chart Placeholder
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Recent Sales Placeholder
          </div>
        </div>
      </div>
    </div>
  )
}   
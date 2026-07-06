import { Grid2X2, List, Search, SlidersHorizontal } from 'lucide-react'

import { CategoryChip } from '@/components/CategoryChip'
import { categories } from '@/data'
import { cn } from '@/lib/utils'
import type { EventCategory, EventMode } from '@/types/migunani'

type FilterBarProps = {
  search: string
  selectedCategory: EventCategory | 'Semua'
  selectedMode: EventMode | 'Semua'
  view: 'grid' | 'list'
  onSearchChange: (value: string) => void
  onCategoryChange: (value: EventCategory | 'Semua') => void
  onModeChange: (value: EventMode | 'Semua') => void
  onViewChange: (value: 'grid' | 'list') => void
  className?: string
}

const modeOptions: Array<EventMode | 'Semua'> = ['Semua', 'Offline', 'Online', 'Hybrid']

export function FilterBar({
  search,
  selectedCategory,
  selectedMode,
  view,
  onSearchChange,
  onCategoryChange,
  onModeChange,
  onViewChange,
  className,
}: FilterBarProps) {
  return (
    <section className={cn('max-w-full overflow-hidden rounded-lg border bg-card p-3 shadow-sm sm:p-4', className)}>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[1fr_150px_170px]">
        <label className="relative block min-w-0">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari event, kota, atau organizer"
            className="h-11 w-full min-w-0 rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <select
          value={selectedMode}
          onChange={(event) => onModeChange(event.target.value as EventMode | 'Semua')}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {modeOptions.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 rounded-md border bg-background p-1">
          <ViewButton active={view === 'grid'} onClick={() => onViewChange('grid')}>
            <Grid2X2 size={16} />
            Grid
          </ViewButton>
          <ViewButton active={view === 'list'} onClick={() => onViewChange('list')}>
            <List size={16} />
            List
          </ViewButton>
        </div>
      </div>

      <div className="scrollbar-none -mx-1 mt-4 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-muted-foreground">
          <SlidersHorizontal size={16} />
          Kategori
        </span>
        <CategoryChip
          category="Semua"
          active={selectedCategory === 'Semua'}
          onClick={() => onCategoryChange('Semua')}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            active={selectedCategory === category.name}
            onClick={() => onCategoryChange(category.name)}
          />
        ))}
      </div>
    </section>
  )
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-sm px-3 text-sm font-bold transition',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}

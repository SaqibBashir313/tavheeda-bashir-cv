import { ArrowUpRight, Building2, MapPin } from 'lucide-react';
import { memo } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Role } from '@/data/resume';
import { pluralize } from '@/utils/misc';

interface RoleCardProps {
  role: Role;
  /** Bullets shown before the "read all" affordance. */
  preview?: number;
  onOpen: (role: Role) => void;
}

function RoleCardComponent({ role, preview = 4, onOpen }: RoleCardProps) {
  const shown = role.highlights.slice(0, preview);
  const remaining = role.highlights.length - shown.length;

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {role.title}
          </h3>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-content-secondary">
            <span className="flex items-center gap-1.5">
              <Building2 aria-hidden="true" className="size-3.5" />
              {role.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              {role.location}
            </span>
          </p>
        </div>
        <Badge tone="brand" size="md" className="font-mono tabular-nums">
          {role.period}
        </Badge>
      </div>

      <ul className="space-y-3">
        {shown.map((highlight) => (
          <li
            key={highlight}
            className="border-l-2 border-line pl-4 text-sm leading-relaxed text-content-secondary"
          >
            {highlight}
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpen(role)}
          rightIcon={<ArrowUpRight className="size-4" />}
        >
          Read {pluralize(remaining, 'further responsibility', 'further responsibilities')}
        </Button>
      ) : null}
    </Card>
  );
}

/** Memoised: opening the dialog must not re-render every other role card. */
export const RoleCard = memo(RoleCardComponent);

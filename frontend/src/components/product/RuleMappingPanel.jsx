import React, { useState, useCallback } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, CheckSquare, Square, GitBranch } from 'lucide-react';
import { cn } from '../../lib/utils';

const ASSET_TABS = [
  { key: 'rules',      label: 'Rules',       badgeCls: 'bg-blue-50 text-blue-700 border-blue-200'   },
  { key: 'grids',      label: 'Grids',       badgeCls: 'bg-violet-50 text-violet-700 border-violet-200' },
  { key: 'scorecards', label: 'Score Cards', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
];

const AssetList = React.memo(function AssetList({ items = [], selectedIds, onToggle, onBulk, badgeCls }) {
  const [q, setQ] = useState('');
  const filtered = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(q.toLowerCase()) ||
      i.code?.toLowerCase().includes(q.toLowerCase())
  );
  const allChecked = filtered.length > 0 && filtered.every((i) => selectedIds.includes(i.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code…"
            className="pl-8 h-8 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-8 text-xs"
          onClick={() => onBulk(filtered.map((i) => i.id), !allChecked)}
        >
          {allChecked
            ? <><CheckSquare className="mr-1 h-3.5 w-3.5" />Deselect All</>
            : <><Square className="mr-1 h-3.5 w-3.5" />Select All</>}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No items found.</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {filtered.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                htmlFor={`asset-${item.id}`}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 transition-colors text-sm',
                  checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <Checkbox
                  id={`asset-${item.id}`}
                  checked={checked}
                  onCheckedChange={() => onToggle(item.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.code && (
                      <Badge variant="outline" className={cn('text-xs py-0', badgeCls)}>
                        {item.code}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} selected · {filtered.length} shown
      </p>
    </div>
  );
});

const RuleMappingPanel = ({ assets = {}, mappings, onMappingsChange }) => {
  const totalMapped = Object.values(mappings).flat().length;

  const handleToggle = useCallback(
    (type, id) => {
      const curr = mappings[type] || [];
      onMappingsChange({
        ...mappings,
        [type]: curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
      });
    },
    [mappings, onMappingsChange]
  );

  const handleBulk = useCallback(
    (type, ids, select) => {
      const curr = mappings[type] || [];
      onMappingsChange({
        ...mappings,
        [type]: select ? [...new Set([...curr, ...ids])] : curr.filter((id) => !ids.includes(id)),
      });
    },
    [mappings, onMappingsChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Map Rules &amp; Assets</p>
            <p className="text-xs text-muted-foreground">
              Select rules, grids, and scorecards that apply to this product.
            </p>
          </div>
        </div>
        {totalMapped > 0 && (
          <Badge variant="secondary">{totalMapped} mapped</Badge>
        )}
      </div>

      <Tabs defaultValue="rules">
        <TabsList className="w-full grid grid-cols-3">
          {ASSET_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
              {tab.label}
              {(mappings[tab.key] || []).length > 0 && (
                <Badge className="ml-1.5 h-4 min-w-4 px-1 text-xs" variant="secondary">
                  {(mappings[tab.key] || []).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {ASSET_TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-3">
            <AssetList
              items={assets[tab.key] || []}
              selectedIds={mappings[tab.key] || []}
              onToggle={(id) => handleToggle(tab.key, id)}
              onBulk={(ids, sel) => handleBulk(tab.key, ids, sel)}
              badgeCls={tab.badgeCls}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RuleMappingPanel;
